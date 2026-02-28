"""
backend/rag/gemini_retriever.py

Context retrieval layer for EmSeed.

Primary flow  : SQLite → EmployeeContext  (retrieval_source always "sqlite_cache")
Enhancement   : enrich_with_gemini() — implemented but NOT wired to main flow.
                Only call it manually / in future sprints.
"""

import asyncio
import sqlite3
from typing import Optional

import google.generativeai as genai

from backend.mcp.schema import EmployeeContext, SignalEntry
from backend.middleware.rate_limit import GEMINI_ROTATOR


# ---------------------------------------------------------------------------
# Internal sync helper — called via asyncio.to_thread to stay non-blocking
# ---------------------------------------------------------------------------

def _fetch_employee_context_sync(
    employee_id: str, db_path: str, days: int
) -> EmployeeContext:
    """
    Fetches employee record + recent signals from SQLite synchronously.
    Raises ValueError if the employee is not found.
    """
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    try:
        # ── Employee record ──────────────────────────────────────────────────
        cur = conn.execute(
            """
            SELECT id, disc_type, language_preference,
                   communication_preference, energy_baseline
            FROM   employees
            WHERE  id = ?
            """,
            (employee_id,),
        )
        row = cur.fetchone()
        if row is None:
            raise ValueError(f"Employee {employee_id} not found")
        employee = dict(row)

        # ── Recent signals ───────────────────────────────────────────────────
        # days is typed int so f-string interpolation is safe here.
        days = int(days)
        sig_cur = conn.execute(
            f"""
            SELECT emoji_code, resonance_score, created_at
            FROM   signals
            WHERE  employee_id = ?
              AND  created_at >= datetime('now', '-{days} days')
            ORDER  BY created_at ASC
            """,
            (employee_id,),
        )
        rows = sig_cur.fetchall()
    finally:
        conn.close()

    signals = [
        SignalEntry(
            emoji_code=r[0],
            resonance_score=r[1],
            created_at=r[2],
        )
        for r in rows
    ]

    # ── Energy weighting ────────────────────────────────────────────────────
    energy = employee["energy_baseline"]
    if signals:
        energy = int(
            0.6 * employee["energy_baseline"] + 0.4 * signals[-1].resonance_score
        )

    return EmployeeContext(
        employee_id=employee["id"],
        disc_type=employee["disc_type"],
        energy_level=energy,
        recent_signals=signals,
        communication_preference=employee["communication_preference"] or "direct",
        language_preference=employee["language_preference"] or "en",
        last_message_resonance=signals[-1].resonance_score if signals else None,
    )


# ---------------------------------------------------------------------------
# Public async API
# ---------------------------------------------------------------------------

async def get_employee_context(
    employee_id: str, db_path: str, days: int = 7
) -> EmployeeContext:
    """
    Retrieve full employee context from SQLite.

    Always returns retrieval_source="sqlite_cache" — Gemini is not called here.
    Raises ValueError if employee_id is not found (caller should map to 404).
    """
    return await asyncio.to_thread(
        _fetch_employee_context_sync, employee_id, db_path, days
    )


async def enrich_with_gemini(context: EmployeeContext, notes: str) -> str:
    """
    Enhancement-only Gemini enrichment. NOT called in the normal demo flow.

    Sends only anonymised, non-identifying context to Gemini.
    Returns a short enrichment string, or "" on any failure / exhausted keys.
    """
    key = GEMINI_ROTATOR.get_key()
    if key is None:
        return ""

    try:
        # ── Anonymise — no employee_id, no names ─────────────────────────────
        anon_context = (
            f"DISC type: {context.disc_type}\n"
            f"Energy level: {context.energy_level}/100\n"
            f"Communication preference: {context.communication_preference}\n"
            f"Language preference: {context.language_preference}\n"
            f"Recent signal count: {len(context.recent_signals)}\n"
            f"Last resonance score: {context.last_message_resonance}\n"
        )
        prompt = (
            f"Team member context (fully anonymised):\n{anon_context}\n"
            f"Additional notes: {notes}\n\n"
            "In one sentence, give a coaching observation about this person's "
            "engagement that would help a leader communicate with them more "
            "effectively. Do not reference any names, IDs, or identifiers."
        )

        genai.configure(api_key=key)
        model = genai.GenerativeModel("gemini-1.5-flash")

        # generate_content is sync; run in thread to stay async-friendly.
        response = await asyncio.to_thread(model.generate_content, prompt)
        GEMINI_ROTATOR.record_use(key)
        return response.text.strip()

    except Exception:
        # Gemini failure must never crash the pipeline.
        return ""


# ---------------------------------------------------------------------------
# Quick smoke-test — run from project root:
#   python -m backend.rag.gemini_retriever
# Pre-req: emseed.db seeded (python scripts/seed_demo.py)
# Expected: disc_type=S, 3 signals, last_resonance=15  (Karan's kill-switch state)
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    ctx = asyncio.run(get_employee_context("emp_002", "./emseed.db"))
    print(f"disc_type:      {ctx.disc_type}")
    print(f"energy_level:   {ctx.energy_level}")
    print(f"signals:        {len(ctx.recent_signals)}")
    print(f"last_resonance: {ctx.last_message_resonance}")

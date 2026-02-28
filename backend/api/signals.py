"""
api/signals.py
Endpoints:
  POST /api/signal/tap — record emoji tap, derive resonance score, call Lead's kill-switch (P0.4)
"""

from fastapi import APIRouter, HTTPException
from backend.db.database import get_db
from backend.models.schemas import (
    SignalTapRequest,
    SignalTapResponse,
    EMOJI_SCORE_MAP,
    success_response,
    error_response,
)

router = APIRouter()


# ── POST /api/signal/tap ──────────────────────────────────────
@router.post("/signal/tap", status_code=201)
async def signal_tap(body: SignalTapRequest):
    """
    Records an emoji tap from an employee.
    - Maps emoji → resonance score
    - Writes to signals table
    - Calls Lead's check_kill_switch() from engines/rlm_engine.py
    - Returns signal + kill-switch result
    """
    db = get_db()
    try:
        # Ensure employee exists
        emp = db.execute(
            "SELECT id FROM employees WHERE id = ?", (body.employee_id,)
        ).fetchone()
        if not emp:
            raise HTTPException(
                status_code=404,
                detail=error_response("EMPLOYEE_NOT_FOUND", f"No employee with id '{body.employee_id}' found.")
            )

        # Derive resonance score
        resonance_score = EMOJI_SCORE_MAP[body.emoji_code]

        # Write signal to DB
        cursor = db.execute("""
            INSERT INTO signals (employee_id, message_id, emoji_code, resonance_score)
            VALUES (?, ?, ?, ?)
        """, (body.employee_id, body.message_id, body.emoji_code, resonance_score))
        db.commit()
        signal_id = cursor.lastrowid

        # Fetch the created_at from DB
        row = db.execute(
            "SELECT created_at FROM signals WHERE id = ?", (signal_id,)
        ).fetchone()
        created_at = row["created_at"] if row else ""

        # Log to audit_log
        import uuid, json
        audit_id = "aud_" + uuid.uuid4().hex[:8]
        db.execute("""
            INSERT INTO audit_log (audit_id, event_type, employee_id, message_id, payload_summary)
            VALUES (?, 'signal_received', ?, ?, ?)
        """, (
            audit_id,
            body.employee_id,
            body.message_id,
            json.dumps({"emoji_code": body.emoji_code, "resonance_score": resonance_score}),
        ))
        db.commit()

        # Call Lead's kill-switch logic (from engines/rlm_engine.py)
        kill_switch_result = _call_kill_switch(body.employee_id, db)

        return success_response({
            "signal_id": signal_id,
            "employee_id": body.employee_id,
            "message_id": body.message_id,
            "emoji_code": body.emoji_code,
            "resonance_score": resonance_score,
            "created_at": created_at,
            "kill_switch_check": kill_switch_result,
        }, status_code=201)

    finally:
        db.close()


def _call_kill_switch(employee_id: str, db) -> dict:
    """
    Calls Lead's check_kill_switch() from engines/rlm_engine.py.
    Falls back gracefully if Lead's module isn't available yet.
    """
    try:
        from backend.engines.rlm_engine import check_kill_switch
        # Fetch recent signals in the format check_kill_switch expects
        rows = db.execute(
            "SELECT resonance_score FROM signals WHERE employee_id = ? ORDER BY created_at ASC",
            (employee_id,)
        ).fetchall()
        recent_signals = [{"resonance_score": r["resonance_score"]} for r in rows]
        return check_kill_switch(employee_id, recent_signals)
    except ImportError:
        # Lead's rlm_engine.py not yet available — return safe default
        return {"status": "ok", "employee_id": employee_id}
    except Exception as e:
        # Never fail the tap because of kill-switch errors
        return {"status": "ok", "employee_id": employee_id, "error": str(e)}

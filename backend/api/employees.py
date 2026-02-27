"""
api/employees.py
Endpoints:
  POST /api/employee/profile       — create or update employee (P0.2)
  GET  /api/employee/{id}/context  — full context for Lead's MCP/RAG (P0.3)
  POST /api/employee/onboard       — DISC survey → auto-assign type (P1.4)
"""

from fastapi import APIRouter, HTTPException
from backend.db.database import get_db
from backend.models.schemas import (
    EmployeeCreate,
    EmployeeResponse,
    EmployeeContext,
    SignalSummary,
    OnboardRequest,
    success_response,
    error_response,
    VALID_DISC,
)

router = APIRouter()


# ── POST /api/employee/profile ────────────────────────────────
@router.post("/employee/profile", status_code=201)
async def create_or_update_employee(body: EmployeeCreate):
    db = get_db()
    try:
        db.execute("""
            INSERT INTO employees
                (id, name, disc_type, language_preference, communication_preference,
                 energy_baseline, team_id, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, strftime('%Y-%m-%dT%H:%M:%SZ','now'), strftime('%Y-%m-%dT%H:%M:%SZ','now'))
            ON CONFLICT(id) DO UPDATE SET
                name                     = excluded.name,
                disc_type                = excluded.disc_type,
                language_preference      = excluded.language_preference,
                communication_preference = excluded.communication_preference,
                energy_baseline          = excluded.energy_baseline,
                team_id                  = excluded.team_id,
                updated_at               = strftime('%Y-%m-%dT%H:%M:%SZ','now')
        """, (
            body.id, body.name, body.disc_type,
            body.language_preference, body.communication_preference,
            body.energy_baseline, body.team_id,
        ))
        db.commit()

        row = db.execute(
            "SELECT * FROM employees WHERE id = ?", (body.id,)
        ).fetchone()

        return success_response(dict(row), status_code=201)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()


# ── GET /api/employee/{id}/context ────────────────────────────
@router.get("/employee/{employee_id}/context")
async def get_employee_context(employee_id: str, days: int = 7):
    """
    Returns full employee context for Lead's MCP/RAG layer.
    Shape must match EmployeeContext in mcp/schema.py — verify with Lead before Hour 2.
    """
    if days > 30:
        days = 30

    db = get_db()
    try:
        # Fetch employee
        emp = db.execute(
            "SELECT * FROM employees WHERE id = ?", (employee_id,)
        ).fetchone()
        if not emp:
            raise HTTPException(
                status_code=404,
                detail=error_response("EMPLOYEE_NOT_FOUND", f"No employee with id '{employee_id}' found.")
            )

        # Recent signals (last N days)
        signals = db.execute("""
            SELECT emoji_code, resonance_score, created_at
            FROM signals
            WHERE employee_id = ?
              AND created_at >= datetime('now', ? || ' days')
            ORDER BY created_at DESC
            LIMIT 10
        """, (employee_id, f"-{days}")).fetchall()

        recent_signals = [
            {"emoji_code": s["emoji_code"], "resonance_score": s["resonance_score"], "created_at": s["created_at"]}
            for s in signals
        ]

        # 7-day rolling average
        avg_row = db.execute("""
            SELECT AVG(resonance_score) as avg_score
            FROM signals
            WHERE employee_id = ?
              AND created_at >= datetime('now', '-7 days')
        """, (employee_id,)).fetchone()
        resonance_7day_avg = round(avg_row["avg_score"] or 0, 1)

        # Last resonance score
        last_signal = db.execute("""
            SELECT resonance_score FROM signals
            WHERE employee_id = ?
            ORDER BY created_at DESC LIMIT 1
        """, (employee_id,)).fetchone()
        last_message_resonance = last_signal["resonance_score"] if last_signal else None

        context = {
            "employee_id": employee_id,
            "disc_type": emp["disc_type"],
            "energy_level": emp["energy_baseline"],
            "recent_signals": recent_signals,
            "resonance_7day_avg": resonance_7day_avg,
            "communication_preference": emp["communication_preference"],
            "language_preference": emp["language_preference"],
            "last_message_resonance": last_message_resonance,
            "retrieval_source": "sqlite_cache",
        }

        return success_response(context)

    finally:
        db.close()


# ── POST /api/employee/onboard ────────────────────────────────
@router.post("/employee/onboard", status_code=201)
async def onboard_employee(body: OnboardRequest):
    """
    Takes DISC survey answers, auto-assigns disc_type by majority vote.
    Requires S's disc/survey_mapping.json — falls back to 'C' if tie.
    """
    # Tally votes
    tally = {"D": 0, "I": 0, "S": 0, "C": 0}
    for answer in body.answers:
        if answer.disc_vote in tally:
            tally[answer.disc_vote] += 1

    # Assign type with highest count (tie → 'C' as safe default)
    disc_type = max(tally, key=lambda k: (tally[k], k == "C"))

    # Create employee with assigned DISC type
    emp_data = EmployeeCreate(
        id=body.employee_id,
        name=body.name,
        disc_type=disc_type,
        language_preference=body.language_preference,
        team_id=body.team_id,
    )
    return await create_or_update_employee(emp_data)

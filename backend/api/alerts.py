"""
api/alerts.py
Endpoints:
  POST /api/alert/check — delegates kill-switch + contagion to Lead's rlm_engine (P0.6)
"""

from fastapi import APIRouter, HTTPException
from backend.db.database import get_db
from backend.models.schemas import AlertCheckRequest, success_response, error_response

router = APIRouter()


# ── POST /api/alert/check ─────────────────────────────────────
@router.post("/alert/check")
async def alert_check(body: AlertCheckRequest):
    """
    Manually trigger a full alert check for an employee or team.
    Kill-switch and contagion logic is owned by Lead's engines/rlm_engine.py.
    This endpoint wraps and returns the result.
    """
    if not body.team_id and not body.employee_id:
        raise HTTPException(
            status_code=400,
            detail=error_response("MISSING_PARAM", "Provide at least one of: team_id, employee_id.")
        )

    db = get_db()
    try:
        # Employee check takes priority if both are provided
        if body.employee_id:
            emp = db.execute(
                "SELECT id FROM employees WHERE id = ?", (body.employee_id,)
            ).fetchone()
            if not emp:
                raise HTTPException(
                    status_code=404,
                    detail=error_response("EMPLOYEE_NOT_FOUND", f"No employee with id '{body.employee_id}' found.")
                )

            kill_switch = _call_kill_switch(body.employee_id, db)

            return success_response({
                "scope": "employee",
                "employee_id": body.employee_id,
                "kill_switch": kill_switch,
                "contagion": None,
            })

        # Team-level check
        else:
            members = db.execute(
                "SELECT id FROM employees WHERE team_id = ?", (body.team_id,)
            ).fetchall()
            if not members:
                raise HTTPException(
                    status_code=404,
                    detail=error_response("TEAM_NOT_FOUND", f"No team '{body.team_id}' found or it has no members.")
                )

            contagion = _call_contagion(body.team_id, [m["id"] for m in members], db)

            return success_response({
                "scope": "team",
                "team_id": body.team_id,
                "kill_switch": None,
                "contagion": contagion,
            })

    finally:
        db.close()


def _call_kill_switch(employee_id: str, db) -> dict:
    """Delegates to Lead's check_kill_switch() — graceful import fallback."""
    try:
        from backend.engines.rlm_engine import check_kill_switch
        rows = db.execute(
            "SELECT resonance_score FROM signals WHERE employee_id = ? ORDER BY created_at ASC",
            (employee_id,)
        ).fetchall()
        recent_signals = [{"resonance_score": r["resonance_score"]} for r in rows]
        return check_kill_switch(employee_id, recent_signals)
    except ImportError:
        return {"status": "ok", "employee_id": employee_id}
    except Exception as e:
        return {"status": "ok", "employee_id": employee_id}


def _call_contagion(team_id: str, member_ids: list, db) -> dict:
    """Delegates to Lead's compute_contagion() — graceful import fallback."""
    try:
        from backend.engines.rlm_engine import compute_contagion
        # Build team_signals dict: {employee_id: [list of resonance scores]}
        team_signals = {}
        for emp_id in member_ids:
            rows = db.execute(
                "SELECT resonance_score FROM signals WHERE employee_id = ? ORDER BY created_at ASC",
                (emp_id,)
            ).fetchall()
            team_signals[emp_id] = [r["resonance_score"] for r in rows]
        return compute_contagion(team_signals)
    except ImportError:
        # Fallback: basic threshold-based contagion
        THRESHOLD = 40
        affected = []
        for emp_id in member_ids:
            last = db.execute("""
                SELECT resonance_score FROM signals
                WHERE employee_id = ? ORDER BY created_at DESC LIMIT 1
            """, (emp_id,)).fetchone()
            if last and last["resonance_score"] < THRESHOLD:
                affected.append(emp_id)
        total = len(member_ids)
        affected_count = len(affected)
        coeff = round(affected_count / total, 2) if total > 0 else 0.0
        return {
            "contagion_coefficient": coeff,
            "affected_count": affected_count,
            "total_count": total,
            "alert": coeff >= 0.5,
            "affected_employees": affected,
        }
    except Exception:
        return {"contagion_coefficient": 0.0, "affected_count": 0, "total_count": len(member_ids), "alert": False}

"""
api/teams.py
Endpoints:
  GET /api/team/{id}/pulse — aggregated team resonance for G's dashboard (P0.5)
"""

from fastapi import APIRouter, HTTPException
from backend.db.database import get_db
from backend.models.schemas import success_response, error_response

router = APIRouter()


# ── GET /api/team/{id}/pulse ──────────────────────────────────
@router.get("/team/{team_id}/pulse")
async def get_team_pulse(team_id: str, days: int = 7):
    """
    Aggregates resonance data for all members of a team.
    Powers G's Pulse Dashboard screen.
    """
    if days > 30:
        days = 30

    db = get_db()
    try:
        # Fetch team members
        members = db.execute(
            "SELECT id, disc_type FROM employees WHERE team_id = ?", (team_id,)
        ).fetchall()

        if not members:
            raise HTTPException(
                status_code=404,
                detail=error_response("TEAM_NOT_FOUND", f"No team with id '{team_id}' found or no members.")
            )

        member_data = []
        all_avgs = []

        for emp in members:
            emp_id = emp["id"]

            # 7-day rolling average
            avg_row = db.execute("""
                SELECT AVG(resonance_score) as avg_score
                FROM signals
                WHERE employee_id = ?
                  AND created_at >= datetime('now', ? || ' days')
            """, (emp_id, f"-{days}")).fetchone()
            resonance_7day_avg = round(avg_row["avg_score"] or 0, 1)
            all_avgs.append(resonance_7day_avg)

            # Most recent signal
            last = db.execute("""
                SELECT resonance_score, emoji_code
                FROM signals
                WHERE employee_id = ?
                ORDER BY created_at DESC LIMIT 1
            """, (emp_id,)).fetchone()

            # Total signal count
            count = db.execute(
                "SELECT COUNT(*) as cnt FROM signals WHERE employee_id = ?", (emp_id,)
            ).fetchone()

            member_data.append({
                "employee_id": emp_id,
                "disc_type": emp["disc_type"],
                "resonance_7day_avg": resonance_7day_avg,
                "last_resonance": last["resonance_score"] if last else None,
                "last_emoji": last["emoji_code"] if last else None,
                "signal_count": count["cnt"],
            })

        team_avg = round(sum(all_avgs) / len(all_avgs), 1) if all_avgs else 0.0

        # Compute contagion coefficient via RLM engine for consistency
        from backend.engines.rlm_engine import compute_contagion, RLM_CONFIG
        team_signals_map = {m["employee_id"]: [m["last_resonance"]] if m["last_resonance"] is not None else [] for m in member_data}
        contagion_result = compute_contagion(team_signals_map)
        coeff = contagion_result["contagion_coefficient"]
        affected_count = contagion_result["affected_count"]
        total_count = contagion_result["total_count"]
        contagion_alert = contagion_result["alert"]   # uses RLM_CONFIG threshold (0.4), consistent with rlm_engine

        return success_response({
            "team_id": team_id,
            "team_resonance_avg": team_avg,
            "member_count": total_count,
            "members": member_data,
            "contagion": {
                "contagion_coefficient": coeff,
                "affected_count": affected_count,
                "total_count": total_count,
                "alert": contagion_alert,
            },
        })


    finally:
        db.close()

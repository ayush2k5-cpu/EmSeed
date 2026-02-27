"""
api/audit.py
Endpoints:
  GET /api/audit/log — paginated audit log (P1.1)
"""

from fastapi import APIRouter, Query
from backend.db.database import get_db
from backend.models.schemas import success_response

router = APIRouter()

VALID_EVENT_TYPES = {
    "mcp_context_call",
    "rewrite_generated",
    "kill_switch_engaged",
    "signal_received",
    "contagion_alert",
}


# ── GET /api/audit/log ────────────────────────────────────────
@router.get("/audit/log")
async def get_audit_log(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100),
    event_type: str = Query(default=None),
    employee_id: str = Query(default=None),
):
    """
    Returns a paginated audit log.
    Filterable by event_type and employee_id.
    """
    db = get_db()
    try:
        # Build dynamic WHERE clause
        conditions = []
        params = []

        if event_type and event_type in VALID_EVENT_TYPES:
            conditions.append("event_type = ?")
            params.append(event_type)

        if employee_id:
            conditions.append("employee_id = ?")
            params.append(employee_id)

        where = f"WHERE {' AND '.join(conditions)}" if conditions else ""

        # Count total matching rows
        total_row = db.execute(
            f"SELECT COUNT(*) as cnt FROM audit_log {where}", params
        ).fetchone()
        total = total_row["cnt"]

        # Fetch page
        offset = (page - 1) * limit
        rows = db.execute(
            f"""
            SELECT id, audit_id, event_type, employee_id, message_id, payload_summary, created_at
            FROM audit_log
            {where}
            ORDER BY id DESC
            LIMIT ? OFFSET ?
            """,
            params + [limit, offset],
        ).fetchall()

        entries = [dict(row) for row in rows]

        return success_response({
            "page": page,
            "limit": limit,
            "total": total,
            "entries": entries,
        })

    finally:
        db.close()

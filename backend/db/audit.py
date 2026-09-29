"""
db/audit.py
One shared, non-raising audit_log writer. Audit is bookkeeping: a failed write
is logged and dropped, never allowed to replace the caller's response.
"""

import asyncio
import json
import logging
import uuid
from typing import Optional

from backend.db.database import get_db

log = logging.getLogger("emseed.audit")

AUDIT_LOCK_WAIT_SECONDS = 1.0


def _insert(audit_id, employee_id, message_id, event_type, details):
    db = get_db(timeout=AUDIT_LOCK_WAIT_SECONDS)
    try:
        db.execute(
            """
            INSERT INTO audit_log (audit_id, event_type, employee_id, message_id, payload_summary)
            VALUES (?, ?, ?, ?, ?)
            """,
            (audit_id, event_type, employee_id, message_id, json.dumps(details)),
        )
        db.commit()
    finally:
        db.close()


async def write_audit(employee_id, message_id, event_type, details) -> Optional[str]:
    """Insert one audit_log row off the event loop. Never raises (except cancellation).
    Returns the audit_id, or None if the write failed (already logged)."""
    audit_id = "aud_" + uuid.uuid4().hex[:8]
    try:
        await asyncio.to_thread(_insert, audit_id, employee_id, message_id, event_type, details)
        return audit_id
    except Exception:
        # Never log details or message text, only ids (AC-8).
        log.exception("audit write failed: event_type=%s employee_id=%s", event_type, employee_id)
        return None

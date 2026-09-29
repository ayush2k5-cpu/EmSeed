# 0001. Safe audit writes through one shared async helper

**Date**: 2026-09-29
**Status**: Accepted

## Summary

Right now, if saving an audit row fails, the user gets an error instead of their rewrite or their kill switch warning. The save also freezes the whole server for a moment, because it runs on the main loop. This spec moves every audit save into one shared helper that runs off the main loop, waits at most one second on a locked database, and on any failure writes a log line and carries on. Users always get the response they were owed. The cost is that a failed audit row is lost, with only the log to show it happened.

## Requirements

**User stories**:
- As a leader, I want my rewrite or kill switch warning to arrive even if the audit log cannot be written, so that a logging problem never hides a safety message.
- As an employee, I want my emoji tap saved and acknowledged even if its audit row fails, so that my reaction is not lost.
- As the developer, I want one audit write path so that a fix or change happens in one place.

**Acceptance criteria**:
- **AC-1**: With the audit table locked by another connection, `POST /api/rewrite` for a healthy recipient returns `success: true` with rewrites, and one ERROR log line records the dropped audit row.
- **AC-2**: With the audit table locked, `POST /api/rewrite` for a recipient whose kill switch fires returns `kill_switch_engaged: true` with the warning message, not `INTERNAL_ERROR`, and one ERROR log line records the dropped row.
- **AC-3**: With the audit table locked, `POST /api/signal/tap` still returns 201, the `signals` row exists, and one ERROR log line records the dropped audit row.
- **AC-4**: With the audit table locked, the MCP `rewrite_message` tool still returns the rewritten text and logs the dropped row. The MCP tool no longer imports anything from `backend/api/`.
- **AC-5**: When the database is healthy, each of the three events writes exactly one `audit_log` row before the response returns, with the same `event_type`, `employee_id`, `message_id` and `payload_summary` shape as today.
- **AC-6**: While an audit write waits on a locked database, an unrelated request (for example `GET /api/audit/log`) is still served within 200 ms. The write does not run on the event loop.
- **AC-7**: A locked audit write gives up after about 1 second (not 5), so it adds at most about 1 second to the response.
- **AC-8**: The failure log line names the `event_type` and `employee_id` and carries the traceback. It never contains the draft message text or the `payload_summary` contents.

## Decision

**Chosen option**: Option 1: Shared async helper, off loop via `asyncio.to_thread`, swallow and log

Every audit write goes through `write_audit` in `backend/db/audit.py`, which runs the insert in a worker thread, waits at most 1 second on a lock, and turns any failure into a log line instead of an error.

## Feature design

**Data model sketch**: no change. `audit_log` stays as in `backend/db/schema.sql` (`audit_id` unique, `event_type` limited by CHECK, `created_at` defaulted by the database).

**State transitions**: none.

**API surface**: no route, input, output or status code changes. The routes below only change how they call the helper.
| Endpoint | Method | Audit event written | Effect of audit failure (new) |
|---|---|---|---|
| /api/rewrite | POST | `rewrite_generated` or `kill_switch_engaged` | None. Same response as a healthy run. |
| /api/signal/tap | POST | `signal_received` | None. Still 201 with the saved signal. |
| MCP `rewrite_message` | tool call | `rewrite_generated` | None. Same tool text. |

**Helper contract** (`backend/db/audit.py`):
```python
AUDIT_LOCK_WAIT_SECONDS = 1.0

async def write_audit(employee_id, message_id, event_type, details) -> Optional[str]:
    """Insert one audit_log row off the event loop. Never raises (except cancellation).
    Returns the audit_id, or None if the write failed (already logged)."""
```
- Generate `audit_id` as `"aud_" + uuid4().hex[:8]` (same as today).
- Do the `json.dumps(details)`, the `get_db(timeout=AUDIT_LOCK_WAIT_SECONDS)` open, the insert and the commit inside one sync function run by `asyncio.to_thread`, all under a `try` that catches `Exception` and calls `log.exception("audit write failed: event_type=%s employee_id=%s", ...)`.
- Always close the connection in `finally`.
- `asyncio.CancelledError` is not caught, so a client disconnect still cancels cleanly.

**Value sourcing**:
| Action | Value produced or displayed | Source |
|---|---|---|
| write_audit | `audit_id` | generated in the helper |
| write_audit | `event_type` | literal chosen by the caller, must be in the schema CHECK list |
| write_audit | `employee_id` | rewrite: `request.recipient_id`; tap: `body.employee_id`; MCP: `recipient_id` |
| write_audit | `message_id` | rewrite: `payload.message_id`; kill switch: `None`; tap: `body.message_id`; MCP: `payload.message_id` |
| write_audit | `payload_summary` | `json.dumps(details)`, where `details` is the caller's existing dictionary, unchanged |
| write_audit | `created_at` | database default |
| failure log line | `event_type`, `employee_id` | the helper's own arguments (never `details`, never the draft text) |
| failure log line | traceback | `log.exception` |

**Key invariants**:
- `write_audit` never raises anything except `asyncio.CancelledError`.
- No audit insert runs on the event loop.
- A route's response body and status are identical whether the audit write succeeds or fails.
- The failure log and `payload_summary` hold no plaintext PII and no message text (existing rule).
- After a successful `write_audit` returns, the row is committed.

**Security model**: unchanged. No new endpoints, no auth changes. No regulated data. Logs carry an employee id, not a name, and never message content.

**Configuration required**: none. `AUDIT_LOCK_WAIT_SECONDS` is a code constant.

**Critical test scenarios** (run by `/check verify` on the real app; no automated tests exist in this project):

To force a failure, hold a write lock from a second connection for the duration of a call:
```bash
python -c "import sqlite3,time; c=sqlite3.connect('emseed.db'); c.execute('BEGIN EXCLUSIVE'); time.sleep(30)"
```
- Failure case: with the lock held, call `POST /api/rewrite` for a healthy recipient, verifies **AC-1**, **AC-7**, **AC-8**
- Failure case: with the lock held, call `POST /api/rewrite` for the kill switch recipient, verifies **AC-2**
- Failure case: fail only the audit insert (a full database lock also blocks the tap's own `signals` insert, so it cannot isolate this case). On a scratch copy of the database run `CREATE TRIGGER block_audit BEFORE INSERT ON audit_log BEGIN SELECT RAISE(ABORT,'audit blocked'); END;`, call `POST /api/signal/tap`, expect 201, a saved `signals` row, no new `audit_log` row and one ERROR log line, then `DROP TRIGGER block_audit;`, verifies **AC-3**
- Failure case: with the lock held, call the MCP `rewrite_message` tool, verifies **AC-4**
- Failure case: while a locked write is waiting, call `GET /api/audit/log` and time it, verifies **AC-6**
- Happy path: with no lock, call each of the three events and read the newest `audit_log` rows through `GET /api/audit/log`, verifies **AC-5**

## Build plan

Approach: Tracer Bullet. Prove the helper on the kill switch path first (the most important thread), then thicken to the other callers.

1. [x] Add a `timeout` argument to `get_db` in `backend/db/database.py` (default 5.0). Create `backend/db/audit.py` with `write_audit` as described above, satisfies **AC-5**, **AC-6**, **AC-7**, **AC-8**
2. [x] In `backend/api/rewrite.py`, replace both `_write_audit` calls with `await write_audit(...)` and delete `_write_audit`. In `backend/mcp/server.py`, import `write_audit` from `backend.db.audit`, `await` it, and remove the bare try/except, satisfies **AC-1**, **AC-2**, **AC-4**
3. [x] In `backend/api/signals.py`, replace the inline audit insert with `await write_audit(...)` and drop the inline `import uuid, json`, satisfies **AC-3**, **AC-5**

## Consequences

**Positive**:
- A logging problem can no longer turn a good rewrite, kill switch warning or tap into an error.
- The event loop is not blocked by audit writes, and a stuck lock costs at most about 1 second.
- One write path replaces three, and the MCP server stops importing from a route file.

**Negative / tradeoffs**:
- A failed audit row is lost. A kill switch engagement could exist with no audit record, and the log line is the only trace. Nothing alerts on it.
- The response can wait up to about 1 second when the database is locked.
- A thread hop adds a little cost per write.
- `_write_audit` is removed, so any code outside this repo that imports it breaks (none found).

**Neutral**:
- Other database calls in these routes (the signal insert, context lookups) are still sync and still block the loop. This spec covers audit writes only.
- No schema change and no migration. Rolling back is a revert of one change.

## Follow-up

- [ ] If the audit trail must be complete, decide later on a retry spool or a failure counter shown in the audit panel. Not needed now.
- [ ] The wider "sync SQLite inside async routes" problem breaks the project's own async rule. If you want it fixed everywhere, that is a separate cross cutting spec.
- [ ] Root `AGENTS.md` lists `middleware/audit.py` in the repo tree, but the file does not exist. Fold the correction into scope feature 7, adding `backend/db/audit.py` at the same time.
- [x] Scope feature 2 wording updated (PR #1 already merged as `c35af08`), 2026-09-29.

# Verify: Safe audit writes · spec 0001 · updated 2026-09-29
_Steps derived from spec 0001 acceptance criteria. `/check verify` runs these; `/test` locks the durable ones._

Lock helper (run in a second terminal, from the repo root, leave it running): `python -c "import sqlite3,time; c=sqlite3.connect('emseed.db'); c.execute('BEGIN EXCLUSIVE'); time.sleep(30)"`

## UI / manual
- [ ] Open the app, compose a rewrite for a healthy recipient with no lock held → rewrites shown, audit badge count goes up by one → AC-5
- [ ] Tap an emoji with no lock held → tap saved, one new `signal_received` row in the audit panel → AC-5

## Commands
- [x] With lock held: `POST /api/rewrite` for a healthy recipient → `success: true` with rewrites, one ERROR line `audit write failed: event_type=rewrite_generated employee_id=...` → AC-1
- [x] With lock held: `POST /api/rewrite` for the kill switch recipient (emp_002, after re-seeding) → `kill_switch_engaged: true` with the warning, not `INTERNAL_ERROR`, one ERROR line → AC-2
- [x] With only `audit_log` inserts failing (trigger `block_audit` on a scratch copy, not a full lock): `POST /api/signal/tap` → 201, `signals` row exists, no new audit row, one ERROR line → AC-3
- [x] With lock held: call MCP `rewrite_message` → returns rewritten text, ERROR line logged; `grep -n "backend.api" backend/mcp/server.py` → no match → AC-4 (checked by calling the real tool function with only the FastMCP wrapper stubbed, because the `mcp` package is not installed in the venv)
- [x] No lock: fire each of the three events, then `GET /api/audit/log` → one new row each, same `event_type`, `employee_id`, `message_id`, `payload_summary` shape as before → AC-5
- [x] With lock held: start a rewrite, and while it waits time `GET /api/audit/log` → served in under 200 ms → AC-6
- [x] With lock held: time `POST /api/rewrite` end to end → the audit wait adds about 1 second, not 5 → AC-7
- [x] Read the ERROR log line → names `event_type` and `employee_id`, has a traceback, contains no draft text and no `payload_summary` content → AC-8

## Value sourcing checks
- [ ] `employee_id` on the row: rewrite = `recipient_id`, tap = `body.employee_id`, MCP = `recipient_id` (vary the recipient and check the row follows) → AC-5
- [x] `message_id` on the row: rewrite = payload id, kill switch = empty, tap = client id → AC-5
- [x] `event_type` is one of the schema CHECK values; `created_at` comes from the database → AC-5

## Acceptance-criteria coverage
- AC-1 … lock + healthy rewrite · AC-2 … lock + kill switch · AC-3 … lock + tap · AC-4 … lock + MCP and import grep · AC-5 … no lock, all three events and value sourcing · AC-6 … timed audit log read · AC-7 … timed rewrite · AC-8 … log line inspection

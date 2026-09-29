# 0001. Safe audit writes through one shared async helper (decision record)

## Context

EmSeed writes an `audit_log` row when a rewrite is generated, when the kill switch engages, and when an emoji tap arrives. The rewrite and kill switch rows go through `_write_audit` in `backend/api/rewrite.py`. The tap route has its own inline copy in `backend/api/signals.py`. The MCP server imports `_write_audit` from the rewrite route file.

Three problems follow from how these work today:
- **Failure becomes the response.** `_write_audit` has no error handling. In `rewrite_message` it sits inside a route wide `except Exception`, so a failed write returns `INTERNAL_ERROR` even though the rewrite succeeded. On the kill switch path the audit call runs before the return, so a failed write hides the warning that tells a leader not to send a message. In `signals.py` the tap is already saved when the audit insert runs, so a failure returns a 500 for work that happened.
- **It blocks the server.** These are plain `sqlite3` calls inside `async` functions. While one waits on a locked database (SQLite waits up to 5 seconds by default), no other request is served. The project rule is "async/await everywhere, no sync blocking calls", and rule 5 says the kill switch must work even when everything else is down.
- **Uneven handling.** The MCP server swallows audit failures with a bare `except: pass`, the API routes do not, and the tap route bypasses the shared function.

The database is one SQLite file in WAL mode (writers wait for each other, readers are not blocked). `audit_log` is unchanged by this work: `event_type` is limited by a CHECK constraint, `payload_summary` must hold no plaintext PII, and `audit_id` is unique.

**Workspace**: single repo, backend only (Python, FastAPI, sync `sqlite3`). The MCP server is a second entry point into the same code, so both entry points must be checked.

## Options considered

### Option 1: Shared async helper, off loop via `asyncio.to_thread`, swallow and log

One `async def write_audit` in `backend/db/audit.py` wraps a small sync insert in `asyncio.to_thread`, uses a 1 second lock wait, and catches any `Exception`. All three callers use it.

**Pros**:
- Standard library only, keeps the existing `sqlite3` code, no new dependency.
- One place to change; fixes all three callers (and the MCP import smell).
- The row exists by the time the response returns, so tests and the audit panel see it.

**Cons**:
- A failed row is gone, with only a log line as evidence.
- The response waits up to about 1 second when the database is locked.

### Option 2: Try/except around the existing `_write_audit` only

Wrap the two calls in `rewrite.py` and leave everything else.

**Pros**:
- Smallest diff, done in minutes.

**Cons**:
- Still blocks the event loop.
- The tap route and MCP server keep their own behaviour and can still fail or duplicate code.

### Option 3: `aiosqlite` for audit writes

Use a real async SQLite driver for the audit path.

**Pros**:
- Truly async, no thread hop.

**Cons**:
- New dependency.
- The rest of the app stays on sync `sqlite3`, so there would be two ways to talk to one database file.

### Option 4: `BackgroundTasks`, write after the response

Send the response first, then write the row.

**Pros**:
- Fastest response, lock waits never reach the user.

**Cons**:
- The row can lag or be lost on a crash, so the audit panel and any check can miss it.
- Does not cover the MCP server, which has no FastAPI response cycle.

## Rationale

The kill switch is the safety path and the audit log is bookkeeping. Rule 5 in `AGENTS.md` says the kill switch must always work, so a bookkeeping failure must never replace its response. That rules out doing nothing and settles that failures are swallowed. The same pattern already exists in the MCP server, so this makes the behaviour uniform rather than new.

`asyncio.to_thread` beats `aiosqlite` and `BackgroundTasks` on the project's actual forces: a small team, sync `sqlite3` used everywhere, no wish for new dependencies, and a need for the row to exist when the response returns so a verify run can see it. A 1 second lock wait balances a lock that clears quickly against a user waiting on a row we are willing to drop anyway. Catching any `Exception` (not only `sqlite3.Error`) is deliberate: a bug in a caller's details dictionary should not turn a good response into an error, and `log.exception` keeps the traceback visible.

Small calls made in this spec (decided here, runner up in brackets):
- The lock wait is a constant in `audit.py`, not an env var (env var). Scope feature 3 covers model settings only, and nobody has asked to tune this.
- `get_db` gains a `timeout` argument that defaults to today's 5 seconds (a separate connect function). This reuses the WAL and foreign key setup and changes nothing for other callers.
- `write_audit` returns the new `audit_id`, or `None` if the write failed (raise on failure). No caller uses the return value today, and this keeps the "never raises" rule.
- Logging uses the standard `logging` module under `emseed.audit`. No log setup exists, and Python's default handler prints ERROR lines to stderr, which shows in the uvicorn console and is safe for the MCP stdio server (stdout carries the protocol).


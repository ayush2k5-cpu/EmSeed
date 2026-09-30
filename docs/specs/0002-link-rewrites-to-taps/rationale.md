# 0002. Link rewrites to taps with the server's message id (decision record)

## Context

**Workspace**: single repo (Python, FastAPI, SQLite backend; React and Vite frontend).

Every `POST /api/rewrite` builds an `MCPPayload`, which creates a `message_id` (a UUID). That id is written on the `rewrite_generated` row in `audit_log`. It is never sent back to the caller.

The dashboard needs an id for the tap screen, so `handleSendAll` in `useDashboardState.ts` makes one on the spot: `msg_<timestamp>`. The tap page posts it to `POST /api/signal/tap`, which saves it on the `signals` row and on a `signal_received` audit row. The two ids never match, so a rewrite and the reaction to it cannot be joined, even though both tables have a `message_id` column.

Other facts that shape the fix:
- `signals.message_id` is indexed. `audit_log.message_id` is not, and `GET /api/audit/log` cannot filter by it.
- The kill switch path writes its audit row with `message_id = NULL`. No message is sent to that person, so there is nothing for them to tap.
- The tap page only records a signal when it has both an employee id and a message id.
- Seeded demo signals use hand written message ids, and no rewrite exists behind them.
- Spec 0001 makes a failed audit write get logged and dropped, so a `rewrite_generated` row can be missing for a message that did get a rewrite.

Without a fix, the one question the product exists to answer, "how did this message land?", cannot be asked of the data by message.

## Options considered

### Option 1: Return the server's id and filter the audit log by it

The rewrite response includes the id the server already makes. The dashboard passes it to the tap page. The audit log endpoint gains a `message_id` filter, which returns both event kinds because both write to `audit_log`.

**Pros**:
- Uses an id and two columns that already exist. No schema change.
- The server stays the source of truth for the id.
- A small change in three places.

**Cons**:
- A dropped audit row (spec 0001) leaves a message with no rewrite row.
- The filter reads an unindexed column.

### Option 2: The client makes the id and sends it with the rewrite call

The dashboard keeps making `msg_<timestamp>` style ids, but sends one to `/api/rewrite`, which stores it.

**Pros**:
- The id exists before the response, which helps if the UI ever needs it early.

**Cons**:
- The server would trust an id from the browser, and two calls could collide or reuse one.
- The MCP tool would still make its own id, so there would be two id sources.

### Option 3: Also save a `messages` row for every rewrite

Return the id and insert a row in the unused `messages` table, so rewrites and taps join through a real record.

**Pros**:
- A proper table for a message, ready for later features.

**Cons**:
- The table stores the draft text, which is more sensitive data than the audit log holds.
- A second write on the rewrite path, right after spec 0001 worked to keep that path safe.

### Option 4: A new `GET /api/messages/{id}/trace` endpoint

Return the id as in Option 1, but expose a new route that shapes the rewrite and its taps into one object.

**Pros**:
- A tidier response for a caller.

**Cons**:
- A new route and response shape for a need this size. The audit filter already gives the same rows.

## Rationale

The id and the two columns already exist, and the only thing wrong is that the id never leaves the server. Returning it fixes the join at the point where it breaks, with no schema change. That suits a small team on a hackathon codebase, where every extra table or route is something to keep working (project rule: keep it simple).

Option 2 was rejected because the server should own the id: a browser made id can repeat, and the MCP path would still use a different source. Option 3 adds a write and stores draft text to solve a join that two existing columns already solve. Option 4 is the same rows in a nicer shape and can be added later without changing this decision.

Tap validation was left out on purpose: rejecting unknown ids would break the seeded demo signals and add a failure to a path that must stay dependable. The cost is that orphan taps are possible, which is listed in Consequences.


# 0002. Link rewrites to taps with the server's message id

**Date**: 2026-09-30
**Status**: Accepted

## Summary

Right now a rewrite and the emoji tap that reacts to it cannot be matched up, because the tap uses an id the dashboard invents while the rewrite is logged under a different id the server made. This spec makes the server return its own message id with each rewrite, carries that id through to the tap, and lets the audit log be filtered by it. One query then returns a rewrite and every reaction to it. Nothing new is stored, and the tap route stays as forgiving as it is today.

## Requirements

**User stories**:
- As a leader, I want the reaction to a message tied to the rewrite that was sent, so that I can tell which wording landed well.
- As the developer, I want to look up a message by its id and see the rewrite and every reaction together, so that I can check the pipeline and later build features on it.

**Acceptance criteria** (the contract, each one independently checkable):
- **AC-1**: A successful `POST /api/rewrite` with rewrites returns `data.message_id`, and it equals the `message_id` on the `rewrite_generated` audit row written for that call.
- **AC-2**: Two rewrite calls return two different message ids.
- **AC-3**: When the kill switch fires, the response has no message id (the key is absent) and its audit row still has an empty `message_id`, as today.
- **AC-4**: In the app, after Generate and then Send, the tap screen posts to `/api/signal/tap` with the same message id the rewrite returned for that recipient. The saved `signals` row and the `signal_received` audit row carry that id.
- **AC-5**: `GET /api/audit/log?message_id=<id>` returns exactly the rows with that id: the one `rewrite_generated` row and each `signal_received` row for it, and nothing for other ids. It works together with the existing `event_type` and `employee_id` filters and with paging. An id with no rows returns `total: 0` and an empty list.
- **AC-6**: If the dashboard has no message id for a rewrite, the tap page does not post a signal. It never makes up an id.
- **AC-7**: `POST /api/signal/tap` still accepts any `message_id` string, including one that no rewrite created (seeded taps, older clients), and still returns 201.
- **AC-8**: Every other field of the rewrite response keeps its current name, place and shape.

## Decision

**Chosen option**: Option 1: Return the server's id and filter the audit log by it

The rewrite response carries the server's `message_id`, the dashboard passes it to the tap page unchanged, and `GET /api/audit/log` gains an optional `message_id` filter.

## Rationale

Reasoning and options: see [rationale.md](rationale.md).

## Feature design

**Data model sketch**: no change. `signals.message_id` and `audit_log.message_id` already exist. No migration and no new index. `audit_log.message_id` stays unindexed at demo scale.

**State transitions**: none.

**Meaning of the id**: one `message_id` stands for one rewrite for one recipient. A leader who sends one draft to three people creates three rewrite calls and so three ids.

**API surface**:
| Endpoint | Method | Key inputs | Key outputs | Auth | Key errors |
|---|---|---|---|---|---|
| /api/rewrite | POST | unchanged | adds `data.message_id` (success with rewrites only) | none (as today) | unchanged |
| /api/signal/tap | POST | unchanged | unchanged | none | unchanged |
| /api/audit/log | GET | adds optional `message_id` (exact match) | unchanged shape | none | unchanged |

**Value sourcing**:
| Action | Value produced / displayed | Source |
|---|---|---|
| rewrite | `data.message_id` | `payload.message_id`, the UUID made when the `MCPPayload` is built (the same value written on the audit row) |
| rewrite (kill switch) | no message id | none by design, nothing is sent |
| dashboard card | the card's message id | `data.message_id` from that recipient's rewrite response |
| Send | tap page `messageId` | the message id on the first approved card (no fallback) |
| tap page | `message_id` in the tap body | router state `messageId` |
| tap route | `signals.message_id`, `signal_received` audit `message_id` | request body `message_id`, unchanged |
| audit log filter | rows returned | query param `message_id`, matched exactly against `audit_log.message_id` |

**Key invariants**:
- The id in the rewrite response is the same value the server logs for that call.
- The frontend never makes up a message id.
- The tap route makes no lookup of the id and never rejects it.
- The filter only reads. It changes no rows.

**Security model**: unchanged. No new endpoints, no auth, no regulated data. A message id is a random UUID with no personal data. The filter value is passed to SQL as a bound parameter, like the existing filters.

**Configuration required**: none.

**Critical test scenarios** (run by `/check verify` on the real app):
- Happy path: call `POST /api/rewrite`, then `GET /api/audit/log?message_id=<returned id>`, expect the `rewrite_generated` row, verifies **AC-1**, **AC-5**
- Happy path: through the app, Generate then Send then tap an emoji, then filter the audit log by that id, expect one `rewrite_generated` and one `signal_received` row, and a `signals` row with the same id, verifies **AC-4**, **AC-5**
- Happy path: two rewrite calls return different ids, verifies **AC-2**
- Failure case: kill switch recipient (`rahul`), expect no `message_id` in the response, verifies **AC-3**
- Failure case: `GET /api/audit/log?message_id=nope`, expect `total: 0`; and a filter for one id never returns another id's rows, verifies **AC-5**
- Failure case: post a tap with `message_id` `seed_manual_1` that no rewrite made, expect 201, verifies **AC-7**
- Failure case: open the tap page with no `messageId` in its state, tap an emoji, expect no request to `/api/signal/tap`, verifies **AC-6**
- Regression: compare the rewrite response before and after, only `message_id` is new, verifies **AC-8**

## Build plan

Approach: Tracer Bullet (the project default). Prove the id end to end with the backend alone first, then wire the frontend.

1. [x] In `backend/api/rewrite.py`, add `"message_id": payload.message_id` to the success response `data`, next to `rewrites`. Leave the kill switch response without it, satisfies **AC-1**, **AC-2**, **AC-3**, **AC-8**
2. [x] In `backend/api/audit.py`, add the optional `message_id` query param and an equality condition in the existing dynamic WHERE. Leave `backend/api/signals.py` untouched; do not add any lookup or rejection to the tap route, satisfies **AC-5**, **AC-7**
3. [x] In the frontend, add `messageId` to the rewrite card type (`frontend/src/types/index.ts`), set it from `json.data.message_id` in `useDashboardState.ts`, and in `handleSendAll` pass the approved card's `messageId` instead of `msg_${Date.now()}`. If the card has no id, send no `messageId`, so the tap page's existing guard skips the post, satisfies **AC-4**, **AC-6**

## Consequences

**Positive**:
- A rewrite and every reaction to it can be found with one call, by one id.
- No schema change, no migration, no new dependency, and a small diff across three places.
- The tap path is no slower and no stricter than it is now.

**Negative / tradeoffs**:
- Only taps made through the new dashboard flow carry a joinable id. Old signals and seeded demo signals stay unlinked.
- If a `rewrite_generated` audit row was dropped (spec 0001), the lookup returns the taps without their rewrite.
- Nothing stops a tap from carrying an id that no rewrite made, so a join can find orphan taps.
- The audit log filter scans an unindexed column. It is fine at demo scale and needs an index if the table grows large.

**Neutral**:
- The MCP `rewrite_message` tool still logs its own id and does not return it. It has no tap step, so nothing joins to it.
- The tap screen still shows only the first approved recipient, so the other recipients' rewrites get ids but no tap.
- A kill switch audit row still has an empty `message_id`.

## Follow-up

- [ ] If the audit log grows large, add `idx_audit_message_id` on `audit_log(message_id)` in `schema.sql`.
- [ ] If leaders need one view of a draft sent to several people, that needs a draft level id, which is a separate decision.
- [ ] Root `AGENTS.md` should mention that `GET /api/audit/log` takes `message_id`, and that the tap id now comes from the rewrite response. Run `/sync` after the build.

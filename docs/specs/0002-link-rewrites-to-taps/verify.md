# Verify: Link rewrites to taps by message id · spec 0002 · updated 2026-09-30
_Steps derived from spec 0002 acceptance criteria. `/check verify` runs these; `/test` locks the durable ones._

## UI / manual
- [x] Open the dashboard, pick two recipients, Generate, approve one, Send, tap an emoji on the tap screen, then read the audit panel and `GET /api/audit/log?message_id=<id>` → one `rewrite_generated` and one `signal_received` row share the id, and the `signals` row has the same id → AC-4
- [x] On the tap screen opened directly with no state (`/tap`), tap an emoji → no request to `/api/signal/tap` in the network tab → AC-6 (checked: no request, and the signals table stayed at 17 rows)

## Commands
- [x] `POST /api/rewrite` for a healthy recipient, then `GET /api/audit/log?message_id=<data.message_id>` → the `rewrite_generated` row has that exact id → AC-1
- [x] Two `POST /api/rewrite` calls → two different `data.message_id` values → AC-2
- [x] `POST /api/rewrite` for `rahul` (kill switch) → `kill_switch_engaged: true`, no `message_id` key; its audit row has an empty `message_id` → AC-3
- [x] `GET /api/audit/log?message_id=nope` → `total: 0`, empty `entries`; a filter for one id returns no rows of another id; with `&event_type=signal_received` only tap rows → AC-5
- [x] `POST /api/signal/tap` with `message_id` `seed_manual_1` that no rewrite made → 201 → AC-7
- [x] Compare a rewrite response to the previous shape → only `data.message_id` is new (`kill_switch_engaged`, `rewrites` unchanged) → AC-8

## Value sourcing checks
- [x] The id on the card equals the id in that recipient's rewrite response, not another recipient's (send to two recipients, approve the second one) → AC-4 (checked with Priyanshu and Granth, approved Granth: the tap carried Granth's id)
- [x] The tap body `message_id` equals the approved card's id (network tab) → AC-4

## Acceptance-criteria coverage
- AC-1 … rewrite then filter · AC-2 … two calls · AC-3 … kill switch · AC-4 … full app flow and value sourcing · AC-5 … filter cases · AC-6 … tap page with no state · AC-7 … unknown id tap · AC-8 … response shape

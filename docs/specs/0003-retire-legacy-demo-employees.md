# 0003. Retire the legacy demo employees by deleting them in the seed script

**Date**: 2026-09-30
**Status**: Accepted

## Summary

Three old demo employees (`emp_001`, `emp_002`, `emp_003`) still sit in some databases. The Vitals tab hides them with a filter, but the backend still counts them in the team size, the team average and the contagion score, so the numbers are quietly wrong. This spec deletes those rows in the seed script, which is the project's existing reset step, and removes the frontend filter. After one re seed, the backend and the screen agree on who is on the team.

## Context

**Workspace**: single repo (FastAPI and SQLite backend, React and Vite frontend).

`emp_001`, `emp_002` and `emp_003` were the original demo roster (Riya, Karan, Priya). The roster was replaced by `priyanshu`, `granth`, `anika` and `rahul`, all in `team_alpha`. `seed_demo.sql` no longer creates the old three, so a fresh clone never has them. A database that was seeded before the change still does, and the seed script never removes them.

The Vitals tab works around this with a filter in `VitalsTab.tsx` that keeps only members found in the mock roster. That hides the rows on screen only. `GET /api/team/{id}/pulse` reads every employee with that `team_id`, so `member_count`, `team_resonance_avg` and the contagion calculation all include the three old rows. A member with no signals counts in the total but adds nothing to the affected count, so the contagion coefficient is diluted. `alerts.py` reads the same employee list for its team check.

Facts that shape the fix:
- Two tables point at `employees(id)`: `signals.employee_id` and `messages.recipient_id`. Foreign keys are switched on, so an employee cannot be deleted while either table still references it. `audit_log.employee_id` is plain text with no foreign key.
- In the current local database the old rows own no signals and no audit rows. Other old databases may.
- `seed_demo.sql` is written to be safe to run repeatedly, and Setup.bat and the project notes already say to re seed before every demo.
- The mock files `frontend/src/mock_data/*.json` and the `emp_002` values in test blocks are separate fallback data, not these database rows.

Until this is fixed, the dashboard and the backend disagree about how many people are on the team.

## Requirements

**User stories**:
- As a leader, I want the team numbers to count only the people who are really on my team, so that the average and the contagion alert can be trusted.
- As the developer, I want the backend and the screen to agree on the roster, so that I do not need a filter to hide bad rows.

**Acceptance criteria** (the contract, each one independently checkable):
- **AC-1**: After the seed script runs on a database that holds `emp_001`, `emp_002` and `emp_003`, the `employees` table has none of those ids and still holds the four roster members.
- **AC-2**: Signals and messages owned by those three ids are removed with them. Signals of every other employee are unchanged, and `audit_log` rows are not touched.
- **AC-3**: Running the seed script twice, or on a database that never had the old rows, succeeds with no error and leaves the same four employees.
- **AC-4**: After the cleanup, `GET /api/team/team_alpha/pulse` returns `member_count: 4`, only the four roster ids, and an average and contagion result computed over those four.
- **AC-5**: The Vitals tab lists every member the pulse returns. Each one shows a name: the mock roster name when known, otherwise the id with its first letter capitalised. An id with no mock entry does not crash the tab.
- **AC-6**: The mock roster filter and its legacy comment are gone from `VitalsTab.tsx`.

## Options considered

### Option 1: Delete the rows in the seed script

`seed_demo.sql` removes the three ids, and any signals and messages that reference them, before it inserts the roster. The frontend filter is removed.

**Pros**:
- No schema change and no new query logic. Every team query is correct because the rows are gone.
- Uses the step the project already treats as the reset (idempotent, run by Setup.bat).
- Nothing in the app deletes data on its own.

**Cons**:
- Anyone with an old database must run the seed once.
- Until they do, the Vitals tab (without its filter) shows the old three.

### Option 2: An `active` flag, filtered in every team query

Add a column, mark the three rows inactive, and filter on it in the pulse and alerts queries.

**Pros**:
- Keeps the rows, which preserves any history attached to them.

**Cons**:
- Needs a migration for databases that already exist (SQLite has no ADD COLUMN IF NOT EXISTS), a new filter in every team query, and one more thing to forget.
- Keeps three dead people in the data to solve a problem that only exists in old local files.

### Option 3: Hardcode the roster ids in the queries

Filter the pulse and alerts queries to a list of known ids.

**Pros**:
- Very quick, and no data changes.

**Cons**:
- The roster lives in code in several places, and adding a person needs a code change.
- The bad rows stay in the database.

## Decision

**Chosen option**: Option 1: Delete the rows in the seed script

`seed_demo.sql` deletes `emp_001`, `emp_002` and `emp_003` with the rows that reference them, and the Vitals filter is removed.

## Rationale

The bad rows exist only in old local databases, not in a fresh clone, so the smallest honest fix is to remove them, not to add a flag and a migration that every future query must respect. A seed script that already resets demo data is the right home: it is safe to repeat, it already runs on setup and before demos, and it keeps deletions out of the app's normal start up (project rule: keep it simple). Running it automatically on every start was rejected because it would delete rows without being asked, including any real employee later given one of these ids.

Audit rows are kept on purpose. They have no foreign key, none exist for these ids here, and the audit log is meant to be a record that is not rewritten. Signals and messages have to go with the employee because the foreign keys require it, and those rows belong to people who are no longer on the roster.

The Vitals tab falls back to a name made from the id, the same way the dashboard already builds names from ids, so nobody is silently hidden again and an unknown id cannot crash the tab. Adding a name to the pulse response is the better long term shape, but it widens this into an API change.

## Feature design

**Data model sketch**: no schema change. The seed script deletes data only.

**State transitions**: none.

**API surface**: no endpoint changes. `GET /api/team/{id}/pulse` and the alerts team check return the same shape, computed over fewer rows.

**Value sourcing**:
| Action | Value produced / displayed | Source |
|---|---|---|
| seed cleanup | which employees to delete | the literal ids `emp_001`, `emp_002`, `emp_003`, decided in this spec |
| seed cleanup | which signals and messages to delete | rows whose `employee_id` (signals) or `recipient_id` (messages) is one of those ids |
| pulse | `member_count`, average, contagion | `employees` rows with the requested `team_id`, unchanged query |
| Vitals bar | member name | the mock roster name for that id, else the pulse `employee_id` with the first letter capitalised |
| Vitals bar | score, emoji, alert flag | the pulse member fields, unchanged |

**Key invariants**:
- The seed script never touches `audit_log`.
- The cleanup deletes child rows (signals, messages) before the employee rows, so foreign keys hold.
- The cleanup is safe to repeat and safe when the rows do not exist.
- The Vitals tab shows every member the backend returns, no more and no fewer.

**Security model**: unchanged. No new endpoints and no regulated data. The script deletes only rows for three fixed demo ids.

**Configuration required**: none.

**Critical test scenarios** (run by `/check verify` on a scratch copy of the database, never your real one):
- Happy path: copy the current database, run the seed, expect the four roster members only, verifies **AC-1**
- Happy path: seed a scratch database that holds the old three with a signal and a message each, run the seed, expect employees, their signals and their messages gone, other employees' signals unchanged, audit rows unchanged, verifies **AC-1**, **AC-2**
- Failure case: run the seed a second time, and run it on a fresh database, expect no error and the same four employees, verifies **AC-3**
- Happy path: call the pulse on the cleaned database, expect `member_count: 4` and four ids, verifies **AC-4**
- Edge case: add one employee through the API with an id not in the mock roster, open the Vitals tab, expect a bar with the capitalised id and no crash, verifies **AC-5**
- Regression: search the frontend for the old filter and the legacy comment, expect none, verifies **AC-6**

## Build plan

Approach: Tracer Bullet (the project default). Prove the backend numbers first, then the screen.

1. [x] In `backend/db/seed_demo.sql`, before the employee inserts, delete signals where `employee_id` is one of the three ids, then messages where `recipient_id` is one of them, then the employees. Do not touch `audit_log`. Verify on a scratch copy, never the real `emseed.db`, satisfies **AC-1**, **AC-2**, **AC-3**, **AC-4**
2. [x] In `frontend/src/components/VitalsTab.tsx`, remove the mock roster filter and its comment, and name each bar from the mock roster if known, otherwise from the capitalised id, satisfies **AC-5**, **AC-6**

## Consequences

**Positive**:
- The team size, average and contagion score count only real team members, and the backend and the screen agree.
- No schema change, no new column and no new query logic.
- One workaround (the frontend filter) is deleted.

**Negative / tradeoffs**:
- An old database keeps the three rows until its owner runs `python scripts/seed_demo.py` once. Until then the Vitals tab shows them, named `Emp_001` and so on.
- Deleted signals and messages for those ids are gone for good. Take a copy of `emseed.db` first if that history matters.
- `/develop` must not run the seed against your real database on its own. Running it there is your step.

**Neutral**:
- The mock JSON files keyed by `emp_001` to `emp_003` and the `emp_002` values in test blocks are separate fallback data and stay.
- A new employee added through the API now appears on the Vitals tab, where the filter used to hide it.

## Follow-up

- [ ] Run `python scripts/seed_demo.py` once on your own `emseed.db` after this ships, after copying it if the old history matters.
- [ ] Root `AGENTS.md` still lists Riya, Karan and Priya as the demo roster. That correction belongs to scope feature 7.
- [ ] If names should come from the backend, add a name to the pulse response. That is a separate API decision.

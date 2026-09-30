# Scope: EmSeed

EmSeed rewrites a leader's message to fit each employee's DISC style, then tracks how the team responds so a kill switch can stop messages that are landing badly. This pass covers post hackathon hardening: making what already works trustworthy before anything new is added.

**Build approach:** Tracer Bullet (prove the whole pipe works with one thin real thread, then thicken one strand at a time).
**Workflow:** Alpha (after develop, run check verify on the real app). The project default level of rigor. `/architect` is the recommended first stop for a feature with a real decision, but skippable when you already know the build.

_These are recommendations to keep your build orderly, not requirements. Skip anything that does not fit: if you already know how to build a feature, use `/develop` and skip `/architect`. You decide when a feature is `done`._

## At a glance

| # | Feature | Phase | Status |
|---|---------|-------|--------|
| A | Rewrite pipeline (DISC prompts, Groq, mock fallback) | Existing | existing |
| B | Kill switch (rule based, per recipient) | Existing | existing |
| C | DISC survey and profile reveal | Existing | existing |
| D | Emoji tap and live Vitals | Existing | existing |
| E | Audit log (write and panel) | Existing | in-progress |
| F | MCP tool server | Existing | existing |
| G | Local launcher (EmSeed.bat) | Existing | in-progress |
| 1 | Safe audit writes | Slice 1 | done |
| 2 | Ship the launcher and the safe audit fix | Slice 1 | done |
| 3 | Env driven model settings | Slice 2 | done |
| 4 | Link rewrites to taps by message id | Slice 2 | done |
| 5 | Retire legacy demo employees | Slice 3 | planned |
| 6 | Shared kill switch name formatting | Slice 3 | planned |
| 7 | Refresh AGENTS.md demo facts | Slice 3 | planned |

## Already built (enrolled for context)

### A. Rewrite pipeline · existing
Compose a message, pick recipients, get a DISC tuned rewrite per person, with a mock fallback when Groq is unavailable. code in `backend/engines/`, `backend/api/rewrite.py`

### B. Kill switch · existing
Rule based check on recent resonance that blocks a rewrite for a recipient whose trend is bad, while healthy recipients still get theirs. code in `backend/engines/rlm_engine.py`

### C. DISC survey and profile reveal · existing
Onboarding survey that maps answers to a DISC archetype and shows the result. code in `frontend/src/pages/DiscSurveyPage.tsx`, `ProfileRevealPage.tsx`

### D. Emoji tap and live Vitals · existing
Employee taps a reaction, the backend records a signal, and the Vitals tab shows live team resonance. code in `frontend/src/pages/EmojiTapPage.tsx`, `frontend/src/components/VitalsTab.tsx`

### E. Audit log · in-progress
The badge opens a real panel and rewrites write audit rows, but the write is unsafe (see feature 1). code in `backend/api/rewrite.py`, `frontend/src/components/Header.tsx`

### F. MCP tool server · existing
Standalone server, registered in `.mcp.json`, connectable from Claude Desktop or Claude Code. code in `backend/mcp/`

### G. Local launcher · in-progress
`EmSeed.bat` starts both servers and opens the app. Works, but is not committed yet. code in `EmSeed.bat`

## Slice 1: Trust the safety path

### 1. Safe audit writes · done
Audit writes must never turn a successful rewrite or kill switch response into an error. This is the one serious finding from the PR #1 review.
**Done when:** a failing or locked audit write is logged and the user still gets the rewrite or kill switch warning, and the write no longer blocks the request loop.
**Spec:** [0001](../specs/0001-safe-audit-writes/index.md)
code in `backend/db/audit.py`, `backend/db/database.py`, `backend/api/rewrite.py`, `backend/api/signals.py`, `backend/mcp/server.py`
- [x] Design it (spec): `/architect safe audit writes`
- [x] Build it: `/develop safe audit writes`
  - [x] Shared helper `backend/db/audit.py` and `get_db` timeout (AC-5, AC-6, AC-7, AC-8)
  - [x] Rewrite route and MCP server use it, old `_write_audit` removed (AC-1, AC-2, AC-4)
  - [x] Tap route uses it (AC-3, AC-5)
- [x] Verify it: `/check verify safe audit writes`

### 2. Ship the launcher and the safe audit fix · done
PR #1 already merged to `main` (`c35af08`). `EmSeed.bat` is committed on `dev/lead`, and `dev/lead` (launcher plus feature 1) is pushed as of 2026-09-29 (`97bdd14`) but not merged to `main` yet.
**Done when:** `EmSeed.bat`, the safe audit writes fix and the docs are on `origin/main`, and a fresh clone starts with the launcher.
Added `Setup.bat` (2026-09-29) so a fresh clone can get the venv, dependencies, `.env` and demo data before the launcher runs.
- [x] Build it: `/develop ship the launcher and the safe audit fix`
- [x] Verify it: `/check verify ship the launcher and the safe audit fix`

## Slice 2: Configuration and data joins

### 3. Env driven model settings · done
Model name and reasoning effort move to environment variables like the existing rate limit settings, with the current values as defaults. The empty text failure without `reasoning_effort="low"` gets a comment.
**Done when:** changing the model or effort in `.env` changes the Groq call with no code edit, and defaults reproduce today's behavior.
- [x] Build it: `/develop env driven model settings`
code in `backend/engines/groq_engine.py`, `.env.example` (`GROQ_MODEL`, `GROQ_REASONING_EFFORT`)
- [x] Verify it: `/check verify env driven model settings`

### 4. Link rewrites to taps by message id · done
The tap signal uses a client made id that does not match the server's id on the rewrite audit row, so a rewrite and its reaction cannot be joined.
**Done when:** a tap records the same message id the rewrite was logged with, and one query returns both for a message.
**Spec:** [0002](../specs/0002-link-rewrites-to-taps/index.md)
code in `backend/api/rewrite.py`, `backend/api/audit.py`, `frontend/src/hooks/useDashboardState.ts`, `frontend/src/types/index.ts`
- [x] Design it (spec): `/architect link rewrites to taps by message id`
- [x] Build it: `/develop link rewrites to taps by message id`
  - [x] Rewrite response returns the server's message id (AC-1, AC-2, AC-3, AC-8)
  - [x] Audit log filter by message id, tap route left as is (AC-5, AC-7)
  - [x] Dashboard carries the real id to the tap page, no made up id (AC-4, AC-6)
- [x] Verify it: `/check verify link rewrites to taps by message id`

## Slice 3: Cleanup

### 5. Retire legacy demo employees · needs a decision
Old `emp_001/2/3` rows still sit in `team_alpha` and are hidden by a frontend filter. The real fix is server side, which needs a status marker or a data migration.
**Done when:** the pulse endpoint returns only current roster members and the frontend filter is removed.
- [ ] Design it (spec): `/architect retire legacy demo employees`

### 6. Shared kill switch name formatting
The name joining logic is duplicated and reads badly for three or more names.
**Done when:** one helper formats the list, both places use it, and three names read correctly.
- [ ] Build it: `/develop shared kill switch name formatting`
- [ ] Verify it: `/check verify shared kill switch name formatting`

### 7. Refresh AGENTS.md demo facts
The demo roster table still lists Riya, Karan and Priya, the Demo Mode section describes a `config.js` that does not exist, and the key table predates the model swap.
**Done when:** AGENTS.md matches the real roster, the real model, and the real frontend config.
- [ ] Build it: `/develop refresh AGENTS.md demo facts`

## Deferred
Out of scope for this pass, kept so the plan stays honest.
- **Slack and Google Meet integrations**: named in the landing copy, absent from the code · needs a decision
- **MCP demo in Claude Desktop**: walk a live tool call end to end · needs a decision
- **Auth and multi team support**: replaces the hardcoded `team_alpha` · needs a decision · GA
- **Automated tests**: none exist today; worth adding once the safety path is fixed · needs a decision
- **Sync SQLite in async routes, everywhere**: the wider version of feature 1's problem, breaks the project's own async rule · needs a decision · from spec 0001
- **Audit failure counter or retry spool**: only if the audit trail must be complete, since spec 0001 drops failed rows and logs them · needs a decision · from spec 0001
- **Draft level message id**: one view of a draft sent to several people, needs its own id and key · needs a decision · from spec 0002
- **Index on audit_log.message_id**: only if the audit table grows large · from spec 0002
## Legend

**The decision box.** Every feature carries at most one box ending in `(spec)`. Its wording varies, so skills find it by that suffix. Every other box is an execution box and `/architect` never ticks one.

- **Next step** is the first unticked box, always a command.
- **needs a decision** means run `/architect` first, otherwise go straight to `/develop`. The tag drops once the spec is captured.
- **Status** goes `planned`, `in-progress`, `done`, plus `existing` (built before this workflow) and `dropped` (kept for history).
- **Workflow** is the project default. Alpha means `/check verify` after `/develop`. Any feature can carry its own tag, for example `· GA`.

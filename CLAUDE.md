# EmSeed — Team Context & Engineering Rules
## Read this first. Every team member. No exceptions.

---

## Project Identity

**Name:** EmSeed: Empathy Operationalised
**Pitch:** "EmSeed doesn't make leaders sound better. It makes sure they're actually heard."
**Hackathon window:** 24 hours
**Demo mode:** Mocked API responses (no live API calls during presentation)

---

## Team

| Handle | Role |
|--------|------|
| Lead | Full Stack + PM — pipeline owner, integration lead |
| P | Backend Dev — SQLite, FastAPI endpoints |
| G | Frontend Dev — React + Tailwind, 4 screens |
| S | Research + Pitch — deck, copy, demo script |

**Primary communication:** Group chat — post blockers immediately, do not solo-solve for >30 min.
**Check-ins:** Every 3 hours (15 min sync).
**Code freeze:** 2 hours before presentation.

---

## Repository Structure

```
EmSeed/
├── backend/
│   ├── main.py              # FastAPI app entry point
│   ├── api/                 # Route handlers (employees, signals, teams, alerts, audit)
│   ├── db/
│   │   ├── schema.sql       # SQLite schema
│   │   └── seed_demo.sql    # Demo data seed
│   ├── engines/
│   │   ├── groq_engine.py   # Groq rewrite pipeline
│   │   ├── sarvam_engine.py # Sarvam Indic rewrite
│   │   ├── rlm_engine.py    # Contagion + kill-switch logic
│   │   └── prompts.py       # DISC system prompts
│   ├── mcp/
│   │   └── schema.py        # MCPPayload + EmployeeContext dataclasses
│   ├── rag/
│   │   └── gemini_retriever.py  # Gemini API context retrieval
│   └── middleware/
│       ├── audit.py         # Audit log middleware
│       └── rate_limit.py    # API rate limiter
├── frontend/
│   ├── src/
│   │   ├── screens/         # Onboarding, Compose, Pulse, KillSwitch
│   │   ├── components/      # RewriteCard, EmojiTap, AlertBanner, etc.
│   │   └── mock_data/       # rewrites.json, pulse.json for demo mode
│   └── public/
├── scripts/
│   └── seed_demo.py         # Seeds Riya, Karan, Priya for demo
├── copy/
│   └── screen_copy.json     # All UX copy — owned by S, consumed by G
├── disc/
│   └── survey_mapping.json  # DISC question → archetype mapping
├── .env.example             # Environment variable template
└── CLAUDE.md                # This file
```

---

## API Keys & Rate Limits

> All keys live in `.env`. Lead distributes at Hour 0. **Never commit `.env` to git.**

| Service | Key Env Var | Free Tier Limit | Our Hard Cap |
|---------|------------|-----------------|--------------|
| Groq | `GROQ_API_KEY` | ~14,400 req/day | **100 req/hr, 10 req/min** |
| Sarvam AI | `SARVAM_API_KEY` | ~500 req/day | **50 req/hr, 5 req/min** |
| Gemini API | `GEMINI_API_KEY` | 60 req/min (free) | **60 req/min, 1,000 req/day** |
| SQLite | local file | unlimited | n/a |

**Rate limit enforcement:** Handled in `middleware/rate_limit.py`. P does not need to implement this — Lead owns it.

**If Groq is rate-limited:** Return mock response from `mock_data/rewrites.json`. Do not fail loudly.
**If Sarvam is rate-limited:** Fall back to Groq with a Hindi-aware English prompt. Log the fallback.
**If Gemini is rate-limited:** Serve context from SQLite cache. `retrieval_source` field in response will say `"sqlite_cache"`.

---

## Engineering Rules

### Non-negotiable

1. **Mock data first.** Build every feature against `mock_data/` first. Wire real APIs in the final sprint. This is how we survive demo day.

2. **SQLite is the source of truth.** P's database is where all employee context lives. Gemini RAG is a retrieval enhancement, not a replacement.

3. **No PII in API calls.** When calling Groq or Sarvam, send only the message text and DISC context. Never send employee names, IDs, or identifiers to third-party APIs.

4. **Every MCP context call gets an `audit_id`.** Lead's middleware auto-generates this. P stores it in `audit_log`. No exceptions.

5. **Kill-switch logic is rule-based.** It does not call any external API. It is a pure Python function in `rlm_engine.py`. It must always work, even if everything else is down.

6. **Demo data must be idempotent.** Running `seed_demo.py` twice should not create duplicate employees. Use `INSERT OR REPLACE`.

### Strongly Preferred

- Python: FastAPI + Pydantic. No Django. No Flask.
- Frontend: React functional components + Tailwind. No class components. No CSS modules.
- Keep components small — if a component file exceeds 150 lines, split it.
- `async/await` everywhere on the backend. No sync blocking calls.
- All API responses follow the common format defined in `API_SPEC.md`.

### Acceptable for Hackathon Scope

- No authentication (all endpoints are open)
- No automated tests (manual testing is fine)
- No Docker (run locally is fine)
- Inline styles in React where Tailwind classes get complex
- Hard-coded team_id in demo (`"team_alpha"`)
- Single SQLite file (`emseed.db`) in the project root

---

## Frontend Rules

### Design System (enforced)

```
Background:   #0D0D0D   (never pure #000000)
Surface:      #161616
Text primary: #F5F0E8
Text muted:   #A89E8C
Accent gold:  #C8A97E   (buttons, highlights, key labels)
Alert red:    #E05A4E   (contagion alerts, kill-switch accents)
Success:      #4CAF7A   (high resonance indicators)
Card radius:  12px
Button radius: 8px
Font:         Inter (Google Fonts)
```

### Screen Copy
- G does not write copy. All UX copy comes from `copy/screen_copy.json` — S delivers this by Hour 3.
- If copy isn't ready, use placeholder text from `PITCH_DECK_OUTLINE.md` Slide 4.

### Demo Mode
```javascript
// frontend/src/config.js
export const DEMO_MODE = process.env.REACT_APP_DEMO_MODE === 'true';

// In API calls:
if (DEMO_MODE) return mockData.rewrites[employeeId];
```
Set `REACT_APP_DEMO_MODE=true` in `.env` before demo. Set to `false` for live API testing.

---

## DISC Quick Reference

| Type | Motivation | Avoid |
|------|-----------|-------|
| D (Dominance) | Challenge, control, results | Hedging, team-speak, over-explaining |
| I (Influence) | Recognition, energy, connection | Cold instructions, bullet lists |
| S (Steadiness) | Stability, belonging, reassurance | Urgency, blame, vague pressure |
| C (Conscientiousness) | Logic, data, quality | Vague directives, hype language |

Full prompt library: `DISC_PROMPT_LIBRARY.md`

---

## Demo Data Reference

| Employee | ID | DISC | Language | State |
|---------|-----|------|----------|-------|
| Riya | `emp_001` | D | English | High resonance (engaged) |
| Karan | `emp_002` | S | Hindi | Low resonance (kill-switch trigger) |
| Priya | `emp_003` | C | English | Moderate resonance (stable) |

Karan's last 3 resonance scores: **40, 15, 15** → kill-switch fires at the demo moment.

---

## Git Workflow

```bash
# Branches
main          ← stable demo build (never break this)
dev/lead      ← Lead's integration branch
dev/p         ← P's backend branch
dev/g         ← G's frontend branch

# Pull request rule: merge to main only after a 2-minute verbal review with another team member
# Commit messages: keep them plain ("add groq engine", "fix signal endpoint", "pulse dashboard UI")
```

**No force pushes to `main`.** If main breaks, Lead owns the fix.

---

## Hackathon Timeline

| Hours | Milestone |
|-------|-----------|
| 0–2 | Schema live (P), MCP + RAG started (Lead), static screens started (G), UX copy delivered (S) |
| 2–6 | Groq pipeline working (Lead), all endpoints live (P), all 4 screens static (G), deck 80% done (S) |
| 6–10 | Full pipeline integrated (Lead + P), frontend wired to APIs (G), deck done (S) |
| 10–18 | Integration tests, demo run-through x2, S runs judge Q&A prep |
| 18–22 | Bug buffer, final demo dry-run x2 |
| 22–24 | Code freeze, submit, present |

---

## If You're Blocked

1. Post in group chat immediately with: **[BLOCKED]** + what you tried + what you need
2. Lead triages all blockers — if it's an API issue, Lead handles it
3. If Lead is unreachable for >20 min: move to your Priority 1 tasks and return to the blocker later
4. **Never delete or rewrite someone else's code** without a verbal check-in first

---

## Key Documents

| Document | Purpose | Owner |
|----------|---------|-------|
| `EMSEED_PROJECT_BRIEF.md` | Product story, philosophy, competitive moat | Lead / all |
| `TECH_STACK.md` | Full architecture, data flow, component specs | Lead |
| `API_SPEC.md` | Endpoint contracts, SQLite schema | P |
| `TEAM_TASKS.md` | Sprint board, priorities, dependencies | Lead / all |
| `DISC_PROMPT_LIBRARY.md` | Groq system prompts per archetype | Lead |
| `PITCH_DECK_OUTLINE.md` | 10-slide structure and spoken content | S |
| `DEMO_SCRIPT.md` | Word-for-word demo with stage directions | S |
| `CLAUDE.md` | This file — team rules and context | All |

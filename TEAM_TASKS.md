# EmSeed — Sprint Task Board
## 24-Hour Hackathon | Team of 4

> **Ground rules:** Mark tasks done in this doc as you ship them. If you hit a blocker, flag it in the group chat immediately — don't wait. Every person owns their list. No task moves between people without a group call.

---

## Role Summary

| Handle | Role | Core Ownership |
|--------|------|----------------|
| **Lead** | Full Stack + PM | RAG layer, MCP schema, RLM engine, Sarvam, Groq pipeline, integration |
| **P** | Backend Dev | SQLite schema, DISC endpoints, signal API, alert threshold engine, audit log |
| **G** | Frontend Dev | 4 screens in Softway.com dark aesthetic |
| **S** | Research + Pitch | 10-slide deck, demo script, judge Q&A, all UX copy for G's screens |

---

## Dependency Map

```
S ──────────────────────────────▶ G
(UX copy, screen text)           (screens implementation)

P ──────────────────────────────▶ Lead
(SQLite + endpoints live)        (context retrieval, rewrite pipeline)

Lead ───────────────────────────▶ G
(API endpoints finalised)        (frontend API integration)

Lead + P ───────────────────────▶ Demo
(backend integrated)             (S runs demo script against it)
```

---

## LEAD — Full Stack + PM

### Priority 0 — Must Ship

| # | Task | Deliverable | Est. |
|---|------|-------------|------|
| L0.1 | Define and commit `MCPPayload` Python dataclass schema | `mcp/schema.py` | 1h |
| L0.2 | Build Gemini API RAG retrieval: takes employee_id, returns context payload | `rag/gemini_retriever.py` | 2h |
| L0.3 | Build Groq rewrite pipeline: takes MCPPayload + DISC prompt, returns 3 rewrites | `engines/groq_engine.py` | 2h |
| L0.4 | Build language detection + Sarvam engine route for Hindi/Indic | `engines/sarvam_engine.py` | 1.5h |
| L0.5 | Build RLM contagion engine: `check_kill_switch()` + `compute_contagion()` | `engines/rlm_engine.py` | 2h |
| L0.6 | Wire full pipeline: compose endpoint → context → rewrite → response | `api/rewrite.py` | 1.5h |
| L0.7 | Integrate with P's SQLite endpoints (test against live DB) | Integration test | 1h |
| L0.8 | Seed mock data for demo (3 employees: Riya D, Karan S, Priya C) | `scripts/seed_demo.py` | 30m |

### Priority 1 — Should Ship

| # | Task | Deliverable | Est. |
|---|------|-------------|------|
| L1.1 | Gemini API fallback: if rate-limited, serve context from SQLite cache | Fallback logic | 1h |
| L1.2 | Audit log middleware: auto-log every MCP call with `audit_id` | `middleware/audit.py` | 1h |
| L1.3 | Rate limiter middleware for Groq + Sarvam (100/hr, 50/hr) | `middleware/rate_limit.py` | 1h |
| L1.4 | POST `/api/rewrite` endpoint fully integrated with P's signal endpoint | API route | 30m |

### Priority 2 — Nice to Have

| # | Task | Deliverable | Est. |
|---|------|-------------|------|
| L2.1 | NotebookLM connector (UI layer for doc-based context) | `rag/notebooklm.py` | 2h |
| L2.2 | Multi-recipient batch rewrite (leader sends to full team at once) | Batch endpoint | 2h |
| L2.3 | Contagion heatmap data endpoint for G's pulse dashboard | `/api/team/{id}/heatmap` | 1h |

### Risks + Fallbacks

| Risk | Fallback |
|------|---------|
| Gemini API rate limit hit | Serve all context from SQLite cache (P's data is the source of truth anyway) |
| Sarvam API down | Skip Indic demo section; English-only is still a complete product |
| RLM integration complexity | Ship simplified rule-based contagion (threshold on rolling average) and label it as "contagion engine v1" |
| Groq latency > 3s | Pre-generate and cache rewrites for the 3 demo employees at startup |

---

## P — Backend Developer

> You own the data layer and API surface. Lead builds on top of your endpoints. **Ship the schema first** — everything else is blocked until the DB is live.

### Priority 0 — Must Ship

| # | Task | Deliverable | Est. |
|---|------|-------------|------|
| P0.1 | Create SQLite schema — all 4 tables (`employees`, `signals`, `messages`, `audit_log`) | `db/schema.sql` | 1h |
| P0.2 | POST `/api/employee/profile` — create or update employee with DISC type | See API_SPEC.md | 1h |
| P0.3 | GET `/api/employee/{id}/context` — return full context payload for Lead's MCP layer | See API_SPEC.md | 1h |
| P0.4 | POST `/api/signal/tap` — receive emoji tap, derive resonance score, write to DB | See API_SPEC.md | 1h |
| P0.5 | GET `/api/team/{id}/pulse` — aggregate team resonance scores for G's dashboard | See API_SPEC.md | 1.5h |
| P0.6 | POST `/api/alert/check` — run kill-switch + contagion threshold logic, return alert payload | See API_SPEC.md | 1.5h |
| P0.7 | Seed demo data: Riya (D), Karan (S, low resonance), Priya (C) via seed script | `scripts/seed_demo.py` | 30m |

### Priority 1 — Should Ship

| # | Task | Deliverable | Est. |
|---|------|-------------|------|
| P1.1 | GET `/api/audit/log` — paginated audit log for admin view | See API_SPEC.md | 1h |
| P1.2 | Resonance rolling average: 7-day window per employee, exposed via context endpoint | Part of P0.3 response | 1h |
| P1.3 | Input validation + error responses for all endpoints (400, 404, 422) | Middleware | 1h |
| P1.4 | DISC onboarding POST endpoint: takes survey answers, auto-assigns DISC type | `/api/employee/onboard` | 1h |

### Priority 2 — Nice to Have

| # | Task | Deliverable | Est. |
|---|------|-------------|------|
| P2.1 | Message history endpoint for employee (last 10 messages + resonance) | `/api/employee/{id}/history` | 1h |
| P2.2 | Team contagion heatmap data endpoint | `/api/team/{id}/heatmap` | 1.5h |
| P2.3 | Export audit log as CSV | `/api/audit/export` | 1h |

### Dependency on Others

| Blocked by | What you need |
|-----------|--------------|
| **Lead** | MCP schema definition (L0.1) — align your `context` response shape to match `EmployeeContext` dataclass before Lead starts RAG layer |
| **S** | DISC survey question mapping (to auto-assign D/I/S/C from survey answers in P1.4) |

### Risks + Fallbacks

| Risk | Fallback |
|------|---------|
| SQLite concurrency issues | Use WAL mode: `PRAGMA journal_mode=WAL;` |
| Alert logic too complex | Expose raw scores; let Lead's `check_kill_switch()` handle the logic |
| DISC auto-assignment fails | Manual DISC assignment in admin UI or seed script |

---

## G — Frontend Developer

> You own the visual product. Work from S's copy first, then wire to Lead's APIs. **Start with static mocked data** — integrate APIs in the final 4 hours.

### Design System (Non-negotiable)
- Background: `#0D0D0D` | Text: `#F5F0E8` | Accent: `#C8A97E` | Alert Red: `#E05A4E`
- Font: `Inter` (Google Fonts) | Card radius: `12px` | Layout: editorial, generous whitespace
- Softway.com aesthetic: dark, warm, typographic, editorial — NOT neon, NOT glassmorphism

### Priority 0 — Must Ship

| # | Task | Screen | Deliverable | Est. |
|---|------|--------|-------------|------|
| G0.1 | DISC Onboarding Survey — 12 questions, progress bar, archetype reveal card | `/onboarding` | Screen 1 (static) | 2h |
| G0.2 | Leader Compose — textarea for raw message, "Rewrite for Team" button | `/compose` | Screen 2 (static) | 1.5h |
| G0.3 | Rewrite Cards — 3 cards side-by-side, each labelled with DISC type + reasoning | `/compose` | Component | 1.5h |
| G0.4 | Kill-Switch Screen — full-screen dark, centred single message, back button | `/kill-switch` | Screen 3 (static) | 1h |
| G0.5 | Team Resonance Pulse — emoji bar chart per employee, overall score | `/pulse` | Screen 4 (static) | 2h |
| G0.6 | Wire Compose screen to POST `/api/rewrite` — display live rewrites | Integration | API connected | 1.5h |
| G0.7 | Wire Pulse screen to GET `/api/team/{id}/pulse` — live resonance data | Integration | API connected | 1h |

### Priority 1 — Should Ship

| # | Task | Deliverable | Est. |
|---|------|-------------|------|
| G1.1 | Emoji tap UI on employee message view (5 emoji options, POST on tap) | Emoji tap component | 1h |
| G1.2 | Kill-Switch trigger: listen to API alert response, auto-navigate to kill-switch screen | Route guard | 1h |
| G1.3 | Contagion alert banner on Pulse dashboard (animated, dismissable) | Alert component | 45m |
| G1.4 | Language toggle: Hindi / English mode on Compose screen | Toggle button | 1h |
| G1.5 | Rewrite card "copy" button + "send" button per card | Card actions | 45m |

### Priority 2 — Nice to Have

| # | Task | Deliverable | Est. |
|---|------|-------------|------|
| G2.1 | Animated resonance score counter (count-up on load) | Animation | 1h |
| G2.2 | Contagion heatmap (grid of avatars coloured by score) | Heatmap component | 2h |
| G2.3 | PWA manifest + service worker (installable on mobile) | `manifest.json` | 1h |
| G2.4 | Micro-animations: card flip on rewrite reveal, pulse ring on emoji tap | Framer Motion | 2h |

### Dependency on Others

| Blocked by | What you need |
|-----------|--------------|
| **S** | All UX copy before starting screens — get this in the first 2 hours |
| **Lead** | API endpoint shapes + base URL — use mock data until confirmed |
| **P** | Pulse data structure for resonance chart |

### Screen Copy Handoff Format (from S)
S will deliver copy as a JSON file: `copy/screen_copy.json`
```json
{
  "onboarding": { "headline": "...", "subline": "...", "questions": [...] },
  "compose": { "placeholder": "...", "cta": "...", "card_labels": [...] },
  "pulse": { "headline": "...", "alert_message": "..." },
  "kill_switch": { "message": "...", "cta": "..." }
}
```

### Risks + Fallbacks

| Risk | Fallback |
|------|---------|
| API not ready | Use `mock_data.json` for all screens — ship static first, wire later |
| Rewrite cards don't fit on screen | Single column scroll layout instead of 3-up grid |
| Hindi font rendering issues | Use Noto Sans Devanagari fallback |

---

## S — Research + Pitch Orchestrator

> You are the narrative engine. Everything you ship makes the product legible to a judge in 3 minutes. **Start with the pitch deck and copy simultaneously** — G can't finish screens without your words.

### Priority 0 — Must Ship

| # | Task | Deliverable | Est. |
|---|------|-------------|------|
| S0.1 | Full 10-slide pitch deck (Canva or Google Slides) — use PITCH_DECK_OUTLINE.md | Slide deck (shareable link) | 3h |
| S0.2 | All UX copy for G's 4 screens in JSON format (`copy/screen_copy.json`) | Delivered to G by Hour 3 | 2h |
| S0.3 | Demo script — word-for-word, with stage directions (see DEMO_SCRIPT.md) | `DEMO_SCRIPT.md` (finalised) | 1.5h |
| S0.4 | Judge Q&A prep — 10 most likely questions with model answers | `JUDGE_QA.md` | 1.5h |

### Priority 1 — Should Ship

| # | Task | Deliverable | Est. |
|---|------|-------------|------|
| S1.1 | One-pager product summary (leave-behind for judges) | PDF, 1 page | 1h |
| S1.2 | Live demo rehearsal x3 with full team — timed at 7 min | Team practice | 1h |
| S1.3 | Slide speaker notes for each slide (for Lead who may be presenting) | Notes in deck | 1h |
| S1.4 | Competitor comparison table (Grammarly, Slack AI, Culture Amp) | Slide 3 asset | 30m |

### Priority 2 — Nice to Have

| # | Task | Deliverable | Est. |
|---|------|-------------|------|
| S2.1 | Short product video (60s, screen recording + voiceover) | MP4 | 2h |
| S2.2 | LinkedIn post draft for post-hackathon publishing | `.md` file | 30m |
| S2.3 | Impact metrics slide: projected ROI at 100-employee company | Slide insert | 45m |

### DISC Survey Questions (deliver to P for P1.4 endpoint)

For each question, answer maps to D/I/S/C. Deliver as `disc/survey_mapping.json`:

```json
[
  {
    "id": 1,
    "question": "When your team faces a crisis, you...",
    "options": [
      { "text": "Take charge immediately and make the call", "disc": "D" },
      { "text": "Rally the team and keep spirits up", "disc": "I" },
      { "text": "Support whoever is leading and ensure everyone's okay", "disc": "S" },
      { "text": "Gather all information before acting", "disc": "C" }
    ]
  }
  // ... 11 more questions
]
```

### Dependency on Others

| Blocked by | What you need |
|-----------|--------------|
| **Lead** | Product story confirmation (read EMSEED_PROJECT_BRIEF.md — that's your source of truth) |
| **G** | Screen screenshots for embedding in pitch deck (get by Hour 8) |

### Risks + Fallbacks

| Risk | Fallback |
|------|---------|
| G's screens not ready for deck | Use wireframe mockups or the design system spec as visuals |
| Demo crashes during presentation | Have the DEMO_SCRIPT.md walkthrough ready as verbal backup — narrate what it *would* show |
| Judging criteria shifts | Keep 3 versions of slide 10: impact-first, tech-first, ethics-first |

---

## Integration Timeline

```
Hour 0–2:   P ships schema + endpoints | Lead starts MCP + RAG
            S ships UX copy to G | G starts static screens

Hour 2–6:   Lead ships Groq pipeline | P ships signal + alert endpoints
            G builds all 4 screens (static) | S works on pitch deck

Hour 6–10:  Lead integrates full pipeline | G integrates APIs
            S finalises deck + rehearsal script

Hour 10–18: Full integration testing | Demo run-through x2
            S runs judge Q&A prep with team | G polishes animations

Hour 18–22: Buffer for bugs | Demo dry-run x2
            Final slide check | Seed data confirmed

Hour 22–24: Freeze code | Final rehearsal
            Submit | Present
```

---

## Communication Protocol

- **Check-in cadence:** Every 3 hours (15-min sync call)
- **Blocker escalation:** Post in group chat immediately — don't solve alone for more than 30 minutes
- **API key sharing:** All keys in shared `.env` file — Lead distributes at Hour 0
- **Demo freeze:** Code freezes 2 hours before presentation — no new features after that

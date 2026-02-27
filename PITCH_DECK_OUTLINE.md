# EmSeed — Pitch Deck Outline
## 10 Slides | Owned by: S | Deck tool: Canva / Google Slides

---

> **Tone:** Calm, confident, human. No hype. No jargon. Let the problem speak for itself, and let the product answer it.
> **Timing:** 7 minutes total. ~45 seconds per slide. Slide 5 and 9 get the most time.
> **Visual theme:** Dark (#0D0D0D), warm gold (#C8A97E) accents, editorial typography. Mirrors the product UI.

---

## Slide 1 — The Story

**Slide Title:** Three people. One message. Three different realities.

### Hero Visual
Full-bleed dark slide. Three side-by-side portrait cards — Riya, Karan, Priya — each with a different emoji reaction floating above them (🔥, 😶, 🤔). A single speech bubble at the top contains the same message: *"Everyone needs to step it up this week."* Below each portrait: a one-word emotion label in warm gold: **MOTIVATED. CRUSHED. CONFUSED.**

### Spoken Content
- Riya reads it as a rallying cry. She's already planning her week.
- Karan reads it as a personal failure. He's been struggling for weeks, and this message just confirmed what he feared.
- Priya doesn't know what it means for her specifically. She'll wait and see.
- The leader meant none of this. They just needed the team to move faster.

### Transition Note
*Pause for 2 seconds after "they just needed the team to move faster."*
*Then: "That gap — between what a leader means and what a person hears — is what EmSeed was built to close."*

---

## Slide 2 — The Problem

**Slide Title:** The numbers behind the silence.

### Hero Visual
Three stark statistics, each on its own line, large typography, centred on a dark background. Colour hierarchy: numbers in white, labels in warm gold, subtext in muted grey. No charts. No complexity. Just weight.

```
$8.8 TRILLION
Lost to disengagement every year.

66%
Experience daily miscommunication at work.

23%
Average global employee engagement.
```

### Spoken Content
- $8.8 trillion is not a rounding error. It is the annual cost of people who showed up physically but left mentally.
- 66% of employees say they experience miscommunication *daily* — not quarterly, not occasionally. Daily.
- 23% engagement means 77 out of every 100 people on your team are coasting, checked out, or silently resisting.
- And the cause isn't bad intent. It's the interpretation gap — the space between what a leader sends and what a person actually receives.

### Transition Note
*"Every tool built to solve this has looked at the wrong end of the problem."*

---

## Slide 3 — The Insight

**Slide Title:** Every tool tracks what people do. None ensure meaning arrives intact.

### Hero Visual
A split visual: left side shows a standard engagement dashboard (Culture Amp / Slack-style, greyed out, labelled "Tracks behaviour"). Right side shows two thought bubbles — the leader's and the employee's — with a gap between them, filled with a question mark. The gap is highlighted in gold.

### Spoken Content
- Grammarly makes you sound smarter. It doesn't know who's reading.
- Slack AI summarises your conversations. It doesn't personalise how you deliver them.
- Culture Amp surveys your team every quarter. By then, Karan has already stopped caring.
- The insight EmSeed is built on: **the message isn't the problem. The landing is.**
- Every tool optimises the sender. EmSeed optimises the moment of arrival.

### Transition Note
*"So we built something that sits between the send button and the human on the other end."*

---

## Slide 4 — The Product

**Slide Title:** EmSeed. Same message. Right soil. Every time.

### Hero Visual
A clean product UI screenshot (or high-fidelity mockup) of the Leader Compose screen — the draft message at the top, three rewrite cards below. Each card is labelled with the recipient name and DISC type. The contrast between the raw draft and the three personalised rewrites is immediately visible. Warm gold "Send" button on the winning card.

### Spoken Content
- EmSeed is a personalised message rewriting assistant for workplace leaders.
- A leader writes one draft. EmSeed rewrites it — not once, but once *per person* — based on their DISC profile, recent emotional signals, and communication history.
- Riya gets the challenge framing she responds to. Karan gets the reassurance he needs. Priya gets the logic and rationale she requires before she'll act.
- Same message. Right soil. Every time.

### Transition Note
*"Here's exactly how it works."*

---

## Slide 5 — How It Works

**Slide Title:** Four steps. One moment of human connection preserved.

### Hero Visual
A clean horizontal 4-step flow diagram on dark background, each step connected by a warm gold arrow. Each node is a rounded card with an icon and a label. Step 4 branches into two paths: green (message lands) and red (kill-switch).

```
[1. LEADER DRAFTS]  →  [2. CONTEXT RETRIEVED]  →  [3. REWRITE GENERATED]  →  [4. LEADER SENDS]
  Raw message           DISC + signals              Groq / Sarvam                Emoji tap
                        MCP schema                  3-5 versions                 Resonance scored
```

### Spoken Content
- Step 1: The leader drafts a message — anything, in any language.
- Step 2: EmSeed retrieves the recipient's context — DISC profile, energy level, recent signal history — via our MCP schema.
- Step 3: The rewrite engine generates 3 to 5 personalised versions. For Hindi or Indic language inputs, Sarvam-M handles this with cultural fluency.
- Step 4: The leader reviews, selects, and sends. The employee responds with an emoji tap. That tap becomes a resonance score. That score feeds a team-wide emotional pulse — and if it drops below a threshold, the system escalates.

### Transition Note
*"The technology that makes this possible is worth understanding."*

---

## Slide 6 — The Technology

**Slide Title:** Built on the frontier. Grounded in the real.

### Hero Visual
A vertical stack architecture diagram — each layer is a labelled block in the dark colour scheme. Left-aligned logos or text labels for each technology. Arrows show data flowing downward. RLM is highlighted separately as the proprietary layer.

```
┌─────────────────────────────────────────┐
│   NotebookLM + Gemini API               │  ← RAG Context Layer
├─────────────────────────────────────────┤
│   Python MCP Schema (Typed Dataclass)   │  ← Structured Context Payload
├─────────────────────────────────────────┤
│   Groq → Llama-3.3-70B                  │  ← English Rewrite Engine
│   Sarvam AI → Sarvam-M                 │  ← Indic Language Engine
├─────────────────────────────────────────┤
│   RLM — Recursive Language Models       │  ← Contagion Analysis (novel)
│   arxiv:2512.24601                      │
├─────────────────────────────────────────┤
│   SQLite (local-first)                  │  ← Privacy-safe Profile Store
└─────────────────────────────────────────┘
```

### Spoken Content
- Context retrieval uses Gemini API with a NotebookLM-style RAG layer — we pull structured employee context on every message.
- Rewrites are powered by Llama-3.3-70B via Groq — fast, high-quality, and calibrated to DISC archetypes through our prompt library.
- For Hindi and Indic languages, Sarvam-M handles the rewrite — not just translation, but culturally aware personalisation.
- The novel piece: RLM — Recursive Language Models — allow us to analyse 30 days of team emotional history in a single context window. It's how we detect emotional contagion before it becomes a resignation.
- Everything is stored locally in SQLite. No employee data leaves the device.

### Transition Note
*"But the most important technology decision we made wasn't an API. It was a values decision."*

---

## Slide 7 — HumAIn First®

**Slide Title:** The kill-switch isn't a bug. It's the point.

### Hero Visual
Full-bleed dark slide — the Kill-Switch screen UI, exactly as it appears in the product. Black background, one line of warm white text centred on screen:

> *"This person doesn't need a better message. They need you."*

No other UI elements. Just the message. Let it sit.

### Spoken Content
- When EmSeed detects that an employee's resonance has dropped below 25 out of 100 — for three consecutive signals — it stops trying to fix the message.
- The screen goes dark. The AI steps back. And it tells the leader: *"This person doesn't need a better message. They need you."*
- We call this HumAIn First. It's our conviction that AI should amplify human connection — not replace it.
- The kill-switch isn't a failure mode. It's a product decision. It's the thing that makes every other feature in EmSeed trustworthy.
- We built the guardrail before we built the engine. That's what responsible AI looks like.

### Transition Note
*"And we built it for a market that has been waiting for exactly this."*

---

## Slide 8 — The Market

**Slide Title:** India first. Indic always. Global by design.

### Hero Visual
A map of India with a warm gold glow at the centre, expanding outward. Surrounding countries highlighted in lighter gold (South Asia, Middle East, Southeast Asia — regions with large Indic diaspora). Key stats overlaid: 600M+ knowledge workers in India; 30M Indic diaspora globally; 22 official languages.

### Spoken Content
- India has over 600 million knowledge workers — the vast majority of whom communicate in Hindi, Telugu, Tamil, Kannada, Marathi, and more at home, and English at work.
- No existing communication tool is built for this context. EmSeed is.
- Sarvam-M gives us native Indic language personalisation — not translation, but rewriting in the voice and context of the person's language.
- Post-India: the Indic diaspora across the Middle East, Southeast Asia, and the UK is 30 million strong and deeply underserved.
- Our competitive moat grows with every language we add. Sarvam is the infrastructure. EmSeed is the application layer on top.

### Transition Note
*"The best way to understand what we've built is to see it."*

---

## Slide 9 — Live Demo

**Slide Title:** *(No title — just the product)*

### Hero Visual
Blank dark slide with a single line of text in warm gold, centred:

> *"Watch what happens when empathy becomes infrastructure."*

Transition immediately to screen share / live demo.

### Spoken Content
*(This slide is a transition. No speaking — just this line on screen for 5 seconds, then move to demo.)*

*(Refer to DEMO_SCRIPT.md for the full word-for-word demo sequence.)*

### Transition Note
*After demo ends, return to slide deck for the final slide.*
*"That's EmSeed. Here's where it goes next."*

---

## Slide 10 — Vision + Ask

**Slide Title:** Every leader. Every language. Every team.

### Hero Visual
A single visual: the word **EmSeed** in large, warm, editorial type — below it, a line of growing seeds in a row, each slightly larger than the last, on a dark ground. Simple. Botanical. Hopeful.

### Spoken Content
- Post-hackathon, EmSeed grows in three directions: more languages via Sarvam, deeper DISC analytics via the RLM contagion layer, and enterprise integrations with Slack, Teams, and Notion.
- The 24-month vision: EmSeed as the empathy infrastructure layer for every enterprise communication tool in India and beyond.
- What we're asking for today: feedback from people who understand what it takes to build something real, and an introduction to any HR-tech or enterprise founder who wants to bring empathy to scale.
- We're not building another engagement dashboard. We're building the thing that ensures a message — any message — lands the way it was meant.
- Because every leader deserves to actually be heard. And every employee deserves to actually feel it.

### Closing Line
*(Delivered without slides, looking directly at the judges):*

> **"EmSeed doesn't make leaders sound better. It makes sure they're actually heard."**

---

## Slide Design Notes for S

| Element | Spec |
|---------|------|
| Background | `#0D0D0D` — pure near-black |
| Primary text | `#F5F0E8` — warm off-white |
| Accent / highlight | `#C8A97E` — warm gold |
| Stats typography | Bold, 64pt+, left-heavy |
| Body text | 18-20pt, Inter or similar |
| Slide margins | Generous — 80px minimum |
| Logo placement | Bottom right, small, every slide |
| Slide numbers | Bottom left, muted grey |
| Animations | Minimal — fade in only, no flying text |

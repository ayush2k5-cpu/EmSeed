# EmSeed — Live Demo Script
## Word-for-Word | Owned by: S | Delivered by: Lead (or S)
## Mode: Mocked / Pre-recorded responses — no live API calls during demo

---

> **Critical:** All API responses shown during demo are **pre-loaded mock data**. The UI calls `mock_data.json` instead of live endpoints. This is intentional — zero demo risk.
>
> **Total demo time:** ~4.5 minutes
>
> **Who presents:** Lead does the screen. S narrates. Or one person does both — rehearse both modes.
>
> **Before you go on stage:** Confirm the browser tab is open to `localhost:3000/compose`, mock data is seeded, and the kill-switch animation has been tested.

---

## Pre-Demo Setup Checklist

- [ ] Browser open to `localhost:3000/compose` (Compose screen visible, draft field empty)
- [ ] Second tab ready at `localhost:3000/pulse` (minimised)
- [ ] Third tab ready at `localhost:3000/kill-switch` (minimised)
- [ ] `seed_demo.py` run — Riya (D), Karan (S, low resonance), Priya (C) loaded in DB
- [ ] Mock rewrite responses pre-loaded in `mock_data/rewrites.json`
- [ ] Kill-switch mock response ready to trigger on button click
- [ ] Screen mirrored to projector — font size bumped to 140% in browser
- [ ] Room lights slightly dimmed if possible — the dark UI needs contrast

---

## The Setup (30 seconds)

**[SLIDE ON SCREEN: Slide 1 — "Three people. One message."]**

**[SAY:]**
> "Before I show you the product, let me show you the problem.
>
> Three people on the same team. Same leader. Same morning. Same message.
>
> Riya, Karan, and Priya."

**[PAUSE — let the slide sit for 3 seconds]**

> "The leader typed: *'Everyone needs to step it up this week.'*
>
> Riya read it and opened her task manager.
>
> Karan read it and closed his laptop.
>
> Priya read it and sent a confused 'thumbs up' reaction and did nothing.
>
> The leader meant the same thing to all three of them. But the message didn't land the same way.
>
> That's the interpretation gap. That's what EmSeed closes."

**[TRANSITION: Switch to browser — Compose screen]**

---

## Step 1 — Leader Drafts (60 seconds)

**[SCREEN: Compose screen — empty draft field, cursor blinking]**

**[SAY:]**
> "This is EmSeed. A leader opens it the same way they'd open a DM.
>
> They have three people they need to message today. One team-wide communication to make.
>
> They type:"

**[ACTION: Slowly type the following into the draft field:]**
```
Everyone needs to step it up this week.
```

**[SAY:]**
> "Plain. Direct. Entirely reasonable.
>
> A leader who means well.
>
> Now — in a normal world, they'd hit send. And the interpretation gap does its damage.
>
> But they're using EmSeed. So they click this button instead."

**[ACTION: Click the "Rewrite for Team" button]**

**[PAUSE — loading animation plays for 1.5 seconds — then three rewrite cards appear]**

**[SAY:]**
> "EmSeed has already retrieved context on Riya, Karan, and Priya.
>
> Their DISC profiles. Their energy levels. Their last week of signal history.
>
> And it's written three different messages. Let's look at each one."

---

## Step 2 — Walking Through the Rewrites (60 seconds)

**[SCREEN: Three rewrite cards visible — labelled Riya (D), Karan (S), Priya (C)]**

**[ACTION: Hover over or tap on Card 1 — Riya (D-type)]**

**[PRE-LOADED MOCK TEXT on Card 1:]**
> *"This week has real stakes. Targets don't move — results do. You know what's needed. Own your piece, move fast, and let's close this out. The outcome is in your hands."*

**[SAY:]**
> "Riya is a D-type — results-driven, autonomous, direct.
>
> EmSeed gave her a challenge. Short. Bold. It respects her competence. It doesn't explain things she already knows.
>
> She'll read this and move."

**[ACTION: Move to Card 2 — Karan (S-type)]**

**[PRE-LOADED MOCK TEXT on Card 2:]**
> *"I want to start by saying — I see the consistent effort you bring, and that matters. This week, I'd love for us to push a little further together. We're in this as a team, and I know we can do it. Thank you for always showing up."*

**[SAY:]**
> "Karan is an S-type — steady, team-focused, and right now, he's fragile.
>
> The same 'step it up' message would have crushed him. This message starts with acknowledgment. It uses 'we' not 'you'. It closes with warmth.
>
> Same leadership intention. Completely different landing.
>
> This is the difference between a good manager and a great one — and EmSeed gives every manager access to it."

**[ACTION: Move to Card 3 — Priya (C-type)]**

**[PRE-LOADED MOCK TEXT on Card 3:]**
> *"To give you the full picture: we're tracking 12% below target for the week. Based on your work on the data pipeline, your contribution to the reporting flow would directly close that gap. I'd like this addressed by EOD Thursday. Flag any blockers early."*

**[SAY:]**
> "Priya is a C-type — analytical, precise, needs the *why* before she acts on the *what*.
>
> EmSeed gave her data, a specific ask, and a deadline.
>
> No fluff. No rally. Just logic.
>
> Three messages. One leader. One click."

---

## Step 3 — Hindi Input Demo (30 seconds)

**[ACTION: Click the language toggle — switch to "Hindi" mode]**

**[ACTION: Clear the draft field and type (or paste):]**
```
इस हफ्ते सभी को और मेहनत करनी होगी।
```
*(Translation: "Everyone needs to work harder this week.")*

**[ACTION: Click "Rewrite for Team" again]**

**[PRE-LOADED MOCK TEXT appears — Karan's card now shows Hindi rewrite via Sarvam-M:]**
> *"पहले यह कहना चाहता हूँ — आपकी मेहनत और लगन मुझे दिखती है, और वो मायने रखती है। इस हफ्ते हम मिलकर थोड़ा और आगे बढ़ें। टीम के साथ हैं हम — और मुझे पूरा भरोसा है कि हम कर सकते हैं।"*

**[SAY:]**
> "The leader switched to Hindi. Karan's preferred language.
>
> Sarvam-M — an Indic language model built for exactly this — rewrote the message. Not translated. *Rewritten.*
>
> Same DISC profile. Same empathy logic. Karan's language. Karan's cultural context.
>
> No other tool does this."

---

## Step 4 — Emoji Tap → Resonance Pulse (60 seconds)

**[ACTION: Switch to Pulse Dashboard tab — `localhost:3000/pulse`]**

**[SCREEN: Team Resonance Pulse dashboard — three employee rows, emoji history bars visible]**

**[SAY:]**
> "Now we fast-forward.
>
> The leader sent the messages. The team received them. And now they're reacting."

**[ACTION: Click the emoji tap simulation buttons — Riya taps 🔥, Priya taps 🫂, then trigger Karan's pre-loaded decline]**

**[SCREEN: Riya's bar is high — green. Priya's bar is moderate — amber. Karan's bar drops to red.]**

**[SAY:]**
> "Riya's resonance is strong — she's engaged.
>
> Priya's stable — she's working.
>
> But Karan has tapped 😶 three times in a row.
>
> Not once. Three times. Over the past week.
>
> EmSeed's RLM engine — Recursive Language Models — has been tracking this.
>
> It's not just seeing a single reaction. It's seeing a pattern.
>
> And now it detects something more:"

**[ACTION: Click "Run Contagion Check" button — alert banner appears]**

**[SCREEN: Red banner appears at top of Pulse dashboard:]**
```
⚠ CONTAGION ALERT — 1 of 3 team members showing sustained disengagement.
Risk of spread detected. Review Karan's signal history.
```

**[SAY:]**
> "The contagion engine has flagged that Karan's disengagement is beginning to affect the team's overall resonance coefficient.
>
> Left unaddressed, this spreads. EmSeed has seen it in the data before it becomes visible to the naked eye.
>
> And now it does something no AI tool has done before."

---

## Step 5 — The Kill-Switch (30 seconds)

**[ACTION: Click "View Karan's Alert" — navigate to Kill-Switch screen (`localhost:3000/kill-switch`)]**

**[SCREEN: Full black screen. Nothing but one line of text, white, centred:]**

> *"This person doesn't need a better message. They need you."*

**[PAUSE — 4 full seconds of silence. Let the screen speak.]**

**[SAY — quietly, slowly:]**
> "The AI has stepped back.
>
> It's not offering another rewrite. It's not suggesting a new emoji strategy.
>
> It's telling the leader: put the phone down. Walk over. Have the conversation.
>
> This is HumAIn First.
>
> We built the kill-switch before we built the engine — because a tool that knows when to get out of the way is the only kind worth building."

**[PAUSE — 2 seconds]**

---

## Closing (30 seconds)

**[ACTION: Return to slide deck — Slide 10 on screen, or keep kill-switch screen up]**

**[SAY:]**
> "Riya, Karan, and Priya are still on the same team.
>
> Still getting messages from the same leader.
>
> But now those messages arrive differently. Riya gets the challenge she responds to. Priya gets the logic she needs. And Karan — Karan gets a leader who showed up.
>
> Not a better message.
>
> A human being.
>
> EmSeed doesn't make leaders sound better."

**[BEAT — one breath]**

> "It makes sure they're actually heard."

**[End demo. Return to Q&A or panel.]**

---

## Fallback Scenarios

> These are plans B and C. Know them cold before you walk on stage.

### If the browser crashes mid-demo:
1. Don't panic. Say: *"Our demo environment hit a hiccup — let me walk you through exactly what you would have seen."*
2. Use PITCH_DECK_OUTLINE.md Slide 5 (the 4-step flow) as a verbal walkthrough
3. Reference the mock rewrite text from Step 2 verbally — you know it by heart

### If the Hindi text doesn't render:
1. Skip the Sarvam demo section entirely
2. Say: *"We've integrated Sarvam-M for Indic language support — happy to show you the output in Q&A."*
3. Move straight from Step 2 to Step 4

### If the kill-switch screen animation doesn't fire:
1. Navigate manually to `/kill-switch` in the browser
2. The static screen is all that matters — just get to it
3. The silence and the text do the work

### If you lose your place:
- The demo flows: Draft → Rewrites → Hindi → Pulse → Kill-Switch → Close
- Say the five words to yourself to reset: **Draft, Rewrites, Hindi, Pulse, Kill-Switch**

---

## Mock Data Reference

All mock responses are in `mock_data/rewrites.json`. The API routes check for `NODE_ENV=demo` and return mock responses instead of calling Groq/Sarvam.

```json
{
  "emp_001_rewrite": "This week has real stakes. Targets don't move — results do. You know what's needed. Own your piece, move fast, and let's close this out. The outcome is in your hands.",
  "emp_002_rewrite": "I want to start by saying — I see the consistent effort you bring, and that matters. This week, I'd love for us to push a little further together. We're in this as a team, and I know we can do it. Thank you for always showing up.",
  "emp_003_rewrite": "To give you the full picture: we're tracking 12% below target for the week. Based on your work on the data pipeline, your contribution to the reporting flow would directly close that gap. I'd like this addressed by EOD Thursday. Flag any blockers early.",
  "emp_002_hindi_rewrite": "पहले यह कहना चाहता हूँ — आपकी मेहनत और लगन मुझे दिखती है, और वो मायने रखती है। इस हफ्ते हम मिलकर थोड़ा और आगे बढ़ें। टीम के साथ हैं हम — और मुझे पूरा भरोसा है कि हम कर सकते हैं।",
  "kill_switch": {
    "status": "kill_switch_engaged",
    "message": "This person doesn't need a better message. They need you."
  }
}
```

---

## Stage Directions Summary

| Time | Screen | Action | Line |
|------|--------|--------|------|
| 0:00 | Slide 1 | Display story slide | "Three people. One message. Three realities." |
| 0:30 | Compose | Type raw message | "Everyone needs to step it up this week." |
| 0:45 | Compose | Click Rewrite | "EmSeed has already retrieved context..." |
| 1:00 | Card 1 (Riya D) | Hover/tap | "Riya is a D-type..." |
| 1:20 | Card 2 (Karan S) | Hover/tap | "Karan is an S-type..." |
| 1:45 | Card 3 (Priya C) | Hover/tap | "Priya is a C-type..." |
| 2:15 | Compose | Switch to Hindi, retype, rewrite | "The leader switched to Hindi..." |
| 2:45 | Pulse | Show dashboard | "The team received them. And now they're reacting." |
| 3:00 | Pulse | Trigger emoji taps + contagion | "Karan has tapped 😶 three times in a row." |
| 3:30 | Kill-Switch | Navigate, silence | *4 seconds silence* |
| 3:34 | Kill-Switch | Speak quietly | "The AI has stepped back." |
| 4:00 | Slide 10 or black | Closing statement | "EmSeed doesn't make leaders sound better." |
| 4:30 | — | END | "It makes sure they're actually heard." |

# EmSeed - Frontend Design & Implementation Guide

**To:** G (Frontend Lead)
**From:** Senior Design Associate & PM Team
**Context:** EmSeed Hackathon Sprint

This document outlines the design language, application flow, and engineering guidelines required to hook up the EmSeed frontend. Your primary goal is to build out the 4 core screens using the enforced design system, ensuring a premium, empathetic user experience that wows the judges.

---

## 1. Tech Stack & Rules

- **Core:** React + TypeScript (Strict) + Tailwind CSS.
- **Components:** Functional components **only**. Keep components small (split if >150 lines).
- **Styling:** Tailwind CSS utilities. No class components, no absolute CSS modules. If Tailwind gets too complex, inline styles are acceptable for hackathon scope.
- **Data Hookup:** Always build against `mock_data/` first. We wire up real APIs in the final sprint.

---

## 2. Design System & Aesthetics

We are going for a **Premium, Dark, and Empathetic** aesthetic. The interface should feel calming but highly responsive. Use subtle micro-animations (hover states, smooth transitions) and glassmorphism (translucency + blur) to create depth.

### Design Tokens (Tailwind Config)
Hook these up in your `tailwind.config.js` / `tailwind.config.ts`:

- **Background:** `#0D0D0D` (Deep void, never pure black)
- **Surface:** `#161616` (Elevated cards)
- **Text Primary:** `#F5F0E8` (Soft off-white for high readability)
- **Text Muted:** `#A89E8C` (For metadata, hints)
- **Accent Gold:** `#C8A97E` (Primary buttons, highlights, key labels)
- **Alert Red:** `#E05A4E` (Contagion alerts, kill-switch accents)
- **Success Green:** `#4CAF7A` (High resonance indicators)

### Typography & Structure
- **Global Font:** Inter (Google Fonts). Use modern font-weights (e.g., tracking-tight, font-medium).
- **Card Radius:** `12px` (`rounded-xl` in Tailwind).
- **Button Radius:** `8px` (`rounded-lg` in Tailwind).

---

## 3. App Flow & The 4 Core Screens

Your scope is exactly 4 screens. Here is how they flow:

### Screen 1: The Pulse Dashboard (Home)
**Purpose:** Shows team resonance levels and alerts.
- **UI Elements:** List of employees (Riya, Karan, Priya), their current resonance scores, and recent trend indicators.
- **Interactions:** Clicking an employee navigates to the Compose screen.
- **Hookup:** Read from `mock_data/pulse.json`.

### Screen 2: Compose & Rewrite (The Magic)
**Purpose:** Where the leader drafts a message and EmSeed works its magic.
- **UI Elements:**
  - A text area for the "Raw Draft".
  - A Context Panel displaying the selected employee's DISC profile and communication style.
  - A carousel or list of `RewriteCard` components containing 3-5 personalised AI-generated versions.
- **Interactions:** User types -> hits "Optimise" -> UI shows loading state -> Displays Rewrites. User can select one and click "Send".
- **Hookup:** Read from `mock_data/rewrites.json`.

### Screen 3: Employee Feedback (EmojiTap)
**Purpose:** The recipient's view where they react to the message.
- **UI Elements:** The received message and a simple, highly polished `EmojiTap` component (e.g., 🚀, 👍, 😐, 📉).
- **Interactions:** Tap an emoji -> triggers a subtle confetti/glow animation -> updates the resonance score.

### Screen 4: The Kill-Switch (Critical Demo Moment)
**Purpose:** A deliberate product feature when emotional complexity is too high to be solved by an AI rewrite.
- **Trigger Condition:** Karan's score hits the threshold (40 -> 15 -> 15).
- **UI Sequence:** 
  1. The Compose screen goes dark (fade to a near-black overlay).
  2. The UI literally "steps back". All buttons disable.
  3. A single, centered `AlertBanner` appears with glowing Alert Red accents.
  4. **Copy:** *"This person doesn't need a better message. They need you."*
- **Aesthetic:** Dramatic, serious, but deeply empathetic.

---

## 4. Key Components to Build

Create these as isolated, reusable functional components:

1. **`RewriteCard`**: Displays an alternative message. Needs a hover state (slight lift + border glow using Accent Gold).
2. **`EmojiTap`**: The feedback widget. Needs active/inactive states and a bounce animation on click.
3. **`AlertBanner`**: For contagion alerts and the Kill-Switch. Needs to look urgent but not broken (use Alert Red `#E05A4E`).
4. **`ContextBadges`**: Small UI pills to show DISC personality types (e.g., "High D", "Low S") with appropriate muted colors.

---

## 5. Engineering Hookup & Demo Mode

As the frontend lead, you must ensure the app can run on rails for the demo.

### Environment & Demo Config
Create a robust mock toggle. Do not rely on live APIs for the presentation.

```tsx
// src/config/env.ts
export const DEMO_MODE = process.env.REACT_APP_DEMO_MODE === 'true';

// Example API Service pattern:
export async function fetchRewrites(employeeId: string, draft: string) {
  if (DEMO_MODE) {
    // Import from mock_data/rewrites.json
    return mockData.rewrites[employeeId];
  }
  // Standard fetch call...
}
```

### State Management
- Keep state local to screens where possible. If sharing state (like the current selected employee or active resonance score), use a simple React Context.
- Do not over-engineer with Redux. 

### Copy & Content
- You do **not** write copy. All UX text must be pulled from `copy/screen_copy.json` (delivered by S). 
- If `screen_copy.json` is not ready, use the placeholder text from `PITCH_DECK_OUTLINE.md` Slide 4. Do not hardcode ad-hoc strings.

---

## Next Steps for G:

1. Setup the React + TypeScript app (e.g., using Vite: `npm create vite@latest . -- --template react-ts`).
2. Install Tailwind CSS and configure the tokens above in `tailwind.config.ts`.
3. Scaffold the `src/screens` and `src/components` directories.
4. Implement the `DEMO_MODE` flag and hook up the JSON files in `src/mock_data/`.
5. Post in the group chat once the base routing and theming are complete!

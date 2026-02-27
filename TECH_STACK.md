# EmSeed — Technical Architecture
## Full Stack Reference Document

---

## Stack Overview

| Layer | Technology | Role |
|-------|-----------|------|
| IDE | Google Antigravity | Development environment (team-standard) |
| Doc Intelligence | NotebookLM (UI) + Gemini API (programmatic) | RAG context retrieval for employee documents |
| Context Schema | Python dataclass — MCP Layer | Typed, structured, auditable context payloads |
| Profile Store | SQLite | Local-first employee profiles + signal history |
| Rewrite Engine | Groq API → Llama-3.3-70B | English message personalisation (3–5 rewrites) |
| Regional Engine | Sarvam AI API → Sarvam-M | Hindi/Indic personalisation |
| Contagion Engine | RLM (arxiv:2512.24601) | Team emotional history analysis |
| Kill-Switch | Python rule engine | Human handoff trigger |
| Frontend | React + Tailwind CSS (PWA) | 4-screen application |
| Audit | JSON log per MCP call | Explainability + compliance |

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          LEADER INTERFACE                               │
│                     React + Tailwind PWA                                │
│                   [Leader Compose Screen]                               │
└──────────────────────────────┬──────────────────────────────────────────┘
                               │  Leader types raw draft message
                               ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         MCP CONTEXT LAYER                               │
│                                                                         │
│  ┌─────────────────────┐    ┌─────────────────────────────────────────┐ │
│  │   Gemini API (RAG)  │    │         SQLite Profile Store            │ │
│  │   NotebookLM source │───▶│  employees | signals | messages        │ │
│  │   Context retrieval │    │  disc_type | energy_level | history    │ │
│  └─────────────────────┘    └──────────────────┬──────────────────────┘ │
│                                                │                        │
│  ┌─────────────────────────────────────────────▼──────────────────────┐ │
│  │              Python Dataclass — MCPPayload                         │ │
│  │  { employee_id, disc_type, energy_level, recent_signals,          │ │
│  │    communication_preference, language_preference, audit_id }      │ │
│  └─────────────────────────────────────────────┬──────────────────────┘ │
└────────────────────────────────────────────────┼────────────────────────┘
                                                 │
                               ┌─────────────────▼──────────────────┐
                               │       Language Detection            │
                               │   (regex + Sarvam language ID)     │
                               └───────┬──────────────┬─────────────┘
                                       │              │
                              [English]│              │[Hindi / Indic]
                                       ▼              ▼
                          ┌────────────────┐  ┌──────────────────────┐
                          │   GROQ API     │  │   SARVAM AI API      │
                          │ Llama-3.3-70B  │  │     Sarvam-M         │
                          │ 3–5 rewrites   │  │  Indic rewrite       │
                          │ per DISC type  │  │  + DISC anchoring    │
                          └───────┬────────┘  └──────────┬───────────┘
                                  └──────────┬───────────┘
                                             │
                                             ▼
                          ┌──────────────────────────────────────┐
                          │    LEADER REVIEWS REWRITE CARDS      │
                          │    Selects preferred version         │
                          │    Approves and sends message        │
                          └──────────────────┬───────────────────┘
                                             │
                                             ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          SIGNAL COLLECTION                              │
│                                                                         │
│   Employee receives message → taps emoji reaction                       │
│   POST /api/signal/tap → resonance_score derived → SQLite signals table │
└──────────────────────────────┬──────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                       RLM CONTAGION ENGINE                              │
│                                                                         │
│   arxiv:2512.24601 | github: alexzhang13/rlm                           │
│   Recursive Language Models for long-context emotional history          │
│   Detects spread of disengagement across team graph                     │
│   Context window: 30 days of signals                                    │
└──────────────────────────────┬──────────────────────────────────────────┘
                               │
               ┌───────────────┴───────────────┐
               │                               │
               ▼                               ▼
   [Score < 25 for 3+ signals]     [Contagion coefficient > 0.4]
               │                               │
               ▼                               ▼
   ┌─────────────────────┐        ┌────────────────────────────┐
   │    KILL-SWITCH      │        │   TEAM RESONANCE ALERT     │
   │  Screen goes dark   │        │   Pulse Dashboard          │
   │  "They need you."   │        │   Contagion heatmap        │
   │  JSON handoff resp  │        │   Alert banner fires       │
   └─────────────────────┘        └────────────────────────────┘
```

---

## Component Specifications

### 1. MCP Context Schema (Python Dataclass)

```python
# mcp/schema.py
from dataclasses import dataclass, field
from typing import Optional, List
from datetime import datetime
import uuid

@dataclass
class SignalEntry:
    emoji_code: str          # "🔥" | "😶" | "🫂" | "🤔" | "✅"
    resonance_score: int     # 0-100 mapped from emoji
    created_at: str          # ISO timestamp

@dataclass
class EmployeeContext:
    employee_id: str
    disc_type: str                         # "D" | "I" | "S" | "C"
    energy_level: int                      # 0-100 (current)
    recent_signals: List[SignalEntry]      # last 7 days
    communication_preference: str         # "direct" | "collaborative" | "supportive" | "analytical"
    language_preference: str              # "en" | "hi" | "te" | "ta" | "kn" | "mr"
    last_message_resonance: Optional[int] = None   # most recent score

@dataclass
class MCPPayload:
    message_id: str = field(default_factory=lambda: str(uuid.uuid4()))
    audit_id: str = field(default_factory=lambda: str(uuid.uuid4()))
    sender_id: str = ""
    recipient_context: Optional[EmployeeContext] = None
    original_draft: str = ""
    retrieval_source: str = "sqlite_cache"    # "gemini_rag" | "sqlite_cache"
    created_at: str = field(default_factory=lambda: datetime.utcnow().isoformat())
```

### Emoji → Resonance Score Mapping

| Emoji | Meaning | Score |
|-------|---------|-------|
| ✅ | Got it, clear | 90 |
| 🔥 | Motivated, energised | 85 |
| 🫂 | Supportive, warm | 75 |
| 🤔 | Confused, uncertain | 40 |
| 😶 | Disengaged, flat | 15 |

---

### 2. Groq Rewrite Engine

```python
# engines/groq_engine.py
import os
from groq import Groq
from mcp.schema import MCPPayload

GROQ_CONFIG = {
    "model": "llama-3.3-70b-versatile",
    "temperature": 0.7,
    "max_tokens": 300,
}

# Rate limits (enforced via middleware)
RATE_LIMITS = {
    "requests_per_hour": 100,
    "requests_per_minute": 10,
    "burst_limit": 3,          # max rewrites per single message call
}

client = Groq(api_key=os.environ["GROQ_API_KEY"])

def generate_rewrite(payload: MCPPayload, system_prompt: str) -> str:
    response = client.chat.completions.create(
        model=GROQ_CONFIG["model"],
        temperature=GROQ_CONFIG["temperature"],
        max_tokens=GROQ_CONFIG["max_tokens"],
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"""
MCP_CONTEXT_PAYLOAD: {payload}
ORIGINAL_MESSAGE: {payload.original_draft}
Generate a personalised rewrite for the above employee context.
"""}
        ]
    )
    return response.choices[0].message.content
```

---

### 3. Sarvam Regional Engine

```python
# engines/sarvam_engine.py
import os
import requests

SARVAM_CONFIG = {
    "base_url": "https://api.sarvam.ai",
    "model": "sarvam-m",
    "api_key_env": "SARVAM_API_KEY",
    "rate_limits": {
        "requests_per_hour": 50,
        "requests_per_minute": 5,
    },
    "supported_languages": ["hi", "te", "ta", "kn", "mr", "bn", "gu", "pa"]
}

def detect_language(text: str) -> str:
    """Returns BCP-47 language code. Falls back to 'en' if unknown."""
    # Simple heuristic: check for Devanagari/other Indic scripts
    # Replace with Sarvam language detection endpoint in production
    if any('\u0900' <= ch <= '\u097F' for ch in text):  # Devanagari range
        return "hi"
    return "en"

def sarvam_rewrite(original: str, disc_type: str, target_language: str) -> str:
    headers = {
        "api-subscription-key": os.environ[SARVAM_CONFIG["api_key_env"]],
        "Content-Type": "application/json"
    }
    payload = {
        "input": original,
        "source_language_code": target_language,
        "target_language_code": target_language,
        "disc_context": disc_type,
        "model": SARVAM_CONFIG["model"]
    }
    response = requests.post(
        f"{SARVAM_CONFIG['base_url']}/text:generate",
        json=payload,
        headers=headers
    )
    return response.json().get("output", original)
```

---

### 4. RLM Contagion Engine

```python
# engines/rlm_engine.py
# Based on: arxiv:2512.24601 | github.com/alexzhang13/rlm

RLM_CONFIG = {
    "context_window_days": 30,
    "contagion_threshold": 0.4,      # spread coefficient to trigger team alert
    "kill_switch_floor": 25,         # resonance score floor
    "kill_switch_consecutive": 3,    # signals below floor to trigger kill-switch
    "min_team_size_for_contagion": 3
}

def check_kill_switch(employee_id: str, recent_signals: list) -> dict:
    """
    Checks last N signals for sustained low resonance.
    Returns kill-switch payload if triggered.
    """
    n = RLM_CONFIG["kill_switch_consecutive"]
    if len(recent_signals) < n:
        return {"status": "ok", "employee_id": employee_id}

    last_n = [s["resonance_score"] for s in recent_signals[-n:]]
    if all(score < RLM_CONFIG["kill_switch_floor"] for score in last_n):
        return {
            "status": "kill_switch_engaged",
            "employee_id": employee_id,
            "reason": "sustained_low_resonance",
            "scores": last_n,
            "recommendation": "direct_human_conversation",
            "message": "This person doesn't need a better message. They need you."
        }
    return {"status": "ok", "employee_id": employee_id}

def compute_contagion(team_signals: dict) -> dict:
    """
    team_signals: { employee_id: [list of resonance scores] }
    Returns contagion coefficient and affected employee IDs.
    """
    low_count = sum(
        1 for signals in team_signals.values()
        if signals and signals[-1] < 40
    )
    total = len(team_signals)
    coefficient = low_count / total if total > 0 else 0

    return {
        "contagion_coefficient": round(coefficient, 2),
        "affected_count": low_count,
        "total_count": total,
        "alert": coefficient >= RLM_CONFIG["contagion_threshold"]
    }
```

---

### 5. Kill-Switch Logic

```python
# engines/kill_switch.py

def engage_kill_switch(employee_id: str, scores: list) -> dict:
    return {
        "status": "kill_switch_engaged",
        "employee_id": employee_id,
        "reason": "sustained_low_resonance",
        "scores": scores,
        "recommendation": "direct_human_conversation",
        "message": "This person doesn't need a better message. They need you.",
        "ui_action": "show_kill_switch_screen"
    }
```

---

## SQLite Schema

```sql
-- ============================================================
-- EmSeed Local Database Schema
-- All tables stored in: ./emseed.db
-- ============================================================

CREATE TABLE IF NOT EXISTS employees (
    id                       TEXT PRIMARY KEY,
    name                     TEXT NOT NULL,
    disc_type                TEXT CHECK(disc_type IN ('D','I','S','C')) NOT NULL,
    language_preference      TEXT DEFAULT 'en',
    communication_preference TEXT CHECK(communication_preference IN
                               ('direct','collaborative','supportive','analytical')),
    energy_baseline          INTEGER DEFAULT 70 CHECK(energy_baseline BETWEEN 0 AND 100),
    team_id                  TEXT,
    created_at               TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at               TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS signals (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id      TEXT NOT NULL REFERENCES employees(id),
    message_id       TEXT,
    emoji_code       TEXT NOT NULL,
    resonance_score  INTEGER NOT NULL CHECK(resonance_score BETWEEN 0 AND 100),
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS messages (
    id              TEXT PRIMARY KEY,
    sender_id       TEXT NOT NULL,
    recipient_id    TEXT REFERENCES employees(id),
    team_id         TEXT,
    original_draft  TEXT NOT NULL,
    selected_rewrite TEXT,
    disc_variant    TEXT,
    language        TEXT DEFAULT 'en',
    sent_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_log (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    audit_id        TEXT UNIQUE NOT NULL,
    event_type      TEXT NOT NULL CHECK(event_type IN (
                      'mcp_context_call','rewrite_generated',
                      'kill_switch_engaged','signal_received','contagion_alert'
                    )),
    employee_id     TEXT,
    message_id      TEXT,
    payload_summary TEXT,    -- JSON summary, NO plaintext PII
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_signals_employee ON signals(employee_id);
CREATE INDEX IF NOT EXISTS idx_signals_created ON signals(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_recipient ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_audit_employee ON audit_log(employee_id);
```

---

## Frontend Design System

### Colour Tokens
```css
:root {
  --bg-primary:    #0D0D0D;   /* near-black base */
  --bg-surface:    #161616;   /* card surfaces */
  --bg-elevated:   #1F1F1F;   /* modals, elevated cards */
  --text-primary:  #F5F0E8;   /* warm off-white */
  --text-secondary:#A89E8C;   /* muted warm grey */
  --accent-gold:   #C8A97E;   /* warm gold — primary action */
  --accent-green:  #4CAF7A;   /* resonance high */
  --accent-red:    #E05A4E;   /* alert / kill-switch */
  --border:        #2A2A2A;   /* subtle borders */
  --radius-card:   12px;
  --radius-btn:    8px;
}
```

### Screen Inventory

| Screen | Route | Owner | Key Components |
|--------|-------|-------|---------------|
| DISC Onboarding | `/onboarding` | G | 12-question survey, progress bar, archetype reveal |
| Leader Compose | `/compose` | G | Draft textarea, 3 rewrite cards, send button |
| Team Resonance Pulse | `/pulse` | G | Emoji aggregation bar, contagion heatmap, alert banner |
| Kill-Switch | `/kill-switch` | G | Full-screen dark, single message line, CTA |

---

## Environment Variables

```bash
# .env.example — copy to .env and fill in values
GROQ_API_KEY=gsk_...
SARVAM_API_KEY=sk_...
GEMINI_API_KEY=AI...
DATABASE_URL=./emseed.db
NODE_ENV=development

# Rate limit overrides (optional)
GROQ_RPH=100
SARVAM_RPH=50
GEMINI_RPM=60
```

---

## Privacy Principles

1. **Local-first**: SQLite database stored on device, no cloud sync by default
2. **No PII in transit**: API calls to Groq/Sarvam contain only message text, not employee names or IDs
3. **Audit trail**: Every MCP context retrieval generates a UUID `audit_id` logged to `audit_log`
4. **Consent-gated**: Employees opt into DISC profiling via the onboarding flow
5. **Kill-switch privacy**: When kill-switch engages, no further data is processed for that employee until leader manually resets

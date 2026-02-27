# EmSeed — Backend API Specification
## Owned by: P | Consumed by: Lead (rewrite pipeline) + G (frontend)

---

## Base URL

```
Development: http://localhost:8000
All routes prefixed with: /api
```

## Authentication

For hackathon scope: **no auth required**. All endpoints are open.
> Note for production: add Bearer token header per endpoint.

## Common Response Format

```json
{
  "success": true,
  "data": { ... },
  "error": null,
  "timestamp": "2026-02-27T10:00:00Z"
}
```

Error response:
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "EMPLOYEE_NOT_FOUND",
    "message": "No employee with id 'emp_999' found."
  },
  "timestamp": "2026-02-27T10:00:00Z"
}
```

---

## Endpoints

---

### 1. POST `/api/employee/profile`

**Purpose:** Create a new employee profile or update an existing one. Used during DISC onboarding.

**Request Body:**
```json
{
  "id": "emp_001",
  "name": "Riya Sharma",
  "disc_type": "D",
  "language_preference": "en",
  "communication_preference": "direct",
  "energy_baseline": 75,
  "team_id": "team_alpha"
}
```

**Field Definitions:**
| Field | Type | Required | Values |
|-------|------|----------|--------|
| `id` | string | Yes | Unique employee ID (e.g., `emp_001`) |
| `name` | string | Yes | Full name |
| `disc_type` | string | Yes | `"D"` \| `"I"` \| `"S"` \| `"C"` |
| `language_preference` | string | No | BCP-47 code: `"en"`, `"hi"`, `"te"`, `"ta"` … Default: `"en"` |
| `communication_preference` | string | No | `"direct"` \| `"collaborative"` \| `"supportive"` \| `"analytical"` |
| `energy_baseline` | integer | No | 0–100. Default: `70` |
| `team_id` | string | No | Team grouping identifier |

**Success Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "emp_001",
    "name": "Riya Sharma",
    "disc_type": "D",
    "language_preference": "en",
    "communication_preference": "direct",
    "energy_baseline": 75,
    "team_id": "team_alpha",
    "created_at": "2026-02-27T10:00:00Z"
  },
  "error": null
}
```

**Error Responses:**
- `400 Bad Request` — missing required fields or invalid `disc_type`
- `422 Unprocessable Entity` — `energy_baseline` out of range

---

### 2. GET `/api/employee/{id}/context`

**Purpose:** Retrieve full context payload for an employee. Called by Lead's MCP layer before each rewrite.

**Path Parameter:**
- `id` — employee ID (e.g., `emp_001`)

**Query Parameters (optional):**
- `days` — number of days of signal history to include (default: `7`, max: `30`)

**Request:** No body.

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "employee_id": "emp_001",
    "disc_type": "D",
    "energy_level": 68,
    "recent_signals": [
      {
        "emoji_code": "✅",
        "resonance_score": 90,
        "created_at": "2026-02-26T14:30:00Z"
      },
      {
        "emoji_code": "😶",
        "resonance_score": 15,
        "created_at": "2026-02-27T09:00:00Z"
      }
    ],
    "resonance_7day_avg": 52,
    "communication_preference": "direct",
    "language_preference": "en",
    "last_message_resonance": 15,
    "retrieval_source": "sqlite_cache"
  },
  "error": null
}
```

**Error Responses:**
- `404 Not Found` — employee ID does not exist

---

### 3. POST `/api/signal/tap`

**Purpose:** Record an employee's emoji reaction to a received message. Derives and stores resonance score.

**Emoji → Score Mapping (applied server-side):**
| Emoji | Code | Resonance Score |
|-------|------|----------------|
| ✅ | `:check:` | 90 |
| 🔥 | `:fire:` | 85 |
| 🫂 | `:hug:` | 75 |
| 🤔 | `:think:` | 40 |
| 😶 | `:blank:` | 15 |

**Request Body:**
```json
{
  "employee_id": "emp_002",
  "message_id": "msg_abc123",
  "emoji_code": "😶"
}
```

**Field Definitions:**
| Field | Type | Required |
|-------|------|----------|
| `employee_id` | string | Yes |
| `message_id` | string | Yes |
| `emoji_code` | string | Yes — must be one of the 5 valid emojis |

**Success Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "signal_id": 42,
    "employee_id": "emp_002",
    "message_id": "msg_abc123",
    "emoji_code": "😶",
    "resonance_score": 15,
    "created_at": "2026-02-27T10:05:00Z",
    "kill_switch_check": {
      "status": "ok",
      "employee_id": "emp_002"
    }
  },
  "error": null
}
```

> **Note:** After saving the signal, this endpoint automatically runs the kill-switch check for that employee and includes the result in the response. Frontend should check `kill_switch_check.status` on every tap response.

**Kill-Switch Response (when triggered):**
```json
{
  "success": true,
  "data": {
    "signal_id": 43,
    "employee_id": "emp_002",
    "emoji_code": "😶",
    "resonance_score": 15,
    "kill_switch_check": {
      "status": "kill_switch_engaged",
      "employee_id": "emp_002",
      "reason": "sustained_low_resonance",
      "scores": [15, 15, 40],
      "recommendation": "direct_human_conversation",
      "message": "This person doesn't need a better message. They need you."
    }
  },
  "error": null
}
```

**Error Responses:**
- `400 Bad Request` — invalid emoji_code or missing fields
- `404 Not Found` — employee_id not found

---

### 4. GET `/api/team/{id}/pulse`

**Purpose:** Retrieve aggregated resonance data for all employees in a team. Powers G's Pulse Dashboard.

**Path Parameter:**
- `id` — team ID (e.g., `team_alpha`)

**Query Parameters (optional):**
- `days` — history window (default: `7`)

**Request:** No body.

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "team_id": "team_alpha",
    "team_resonance_avg": 58,
    "member_count": 3,
    "members": [
      {
        "employee_id": "emp_001",
        "disc_type": "D",
        "resonance_7day_avg": 82,
        "last_resonance": 90,
        "last_emoji": "✅",
        "signal_count": 5
      },
      {
        "employee_id": "emp_002",
        "disc_type": "S",
        "resonance_7day_avg": 22,
        "last_resonance": 15,
        "last_emoji": "😶",
        "signal_count": 3
      },
      {
        "employee_id": "emp_003",
        "disc_type": "C",
        "resonance_7day_avg": 71,
        "last_resonance": 75,
        "last_emoji": "🫂",
        "signal_count": 4
      }
    ],
    "contagion": {
      "contagion_coefficient": 0.33,
      "affected_count": 1,
      "total_count": 3,
      "alert": false
    }
  },
  "error": null
}
```

**Error Responses:**
- `404 Not Found` — team ID not found
- `200 OK with empty members` — team exists but no members yet

---

### 5. POST `/api/alert/check`

**Purpose:** Manually trigger a full alert check for a team or employee. Called by Lead's RLM engine or periodically by frontend polling.

**Request Body:**
```json
{
  "team_id": "team_alpha",
  "employee_id": "emp_002"
}
```

> Either `team_id` or `employee_id` must be provided. If both provided, employee check takes priority.

**Success Response — No Alert (200 OK):**
```json
{
  "success": true,
  "data": {
    "scope": "employee",
    "employee_id": "emp_002",
    "kill_switch": {
      "status": "ok"
    },
    "contagion": null
  },
  "error": null
}
```

**Success Response — Kill-Switch Engaged:**
```json
{
  "success": true,
  "data": {
    "scope": "employee",
    "employee_id": "emp_002",
    "kill_switch": {
      "status": "kill_switch_engaged",
      "reason": "sustained_low_resonance",
      "scores": [15, 15, 40],
      "recommendation": "direct_human_conversation",
      "message": "This person doesn't need a better message. They need you."
    },
    "contagion": null
  },
  "error": null
}
```

**Success Response — Contagion Alert:**
```json
{
  "success": true,
  "data": {
    "scope": "team",
    "team_id": "team_alpha",
    "kill_switch": null,
    "contagion": {
      "contagion_coefficient": 0.67,
      "affected_count": 2,
      "total_count": 3,
      "alert": true,
      "affected_employees": ["emp_002", "emp_003"]
    }
  },
  "error": null
}
```

---

### 6. GET `/api/audit/log`

**Purpose:** Retrieve paginated audit log of all MCP context calls and system events.

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | int | `1` | Page number |
| `limit` | int | `20` | Entries per page (max: 100) |
| `event_type` | string | all | Filter: `mcp_context_call`, `rewrite_generated`, `kill_switch_engaged`, `signal_received`, `contagion_alert` |
| `employee_id` | string | all | Filter by employee |

**Request:** No body.

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "page": 1,
    "limit": 20,
    "total": 47,
    "entries": [
      {
        "id": 47,
        "audit_id": "aud_f3a2b1c0",
        "event_type": "kill_switch_engaged",
        "employee_id": "emp_002",
        "message_id": null,
        "payload_summary": "{\"reason\":\"sustained_low_resonance\",\"score_floor\":25}",
        "created_at": "2026-02-27T10:05:00Z"
      },
      {
        "id": 46,
        "audit_id": "aud_e2a1b0c9",
        "event_type": "mcp_context_call",
        "employee_id": "emp_001",
        "message_id": "msg_abc123",
        "payload_summary": "{\"disc_type\":\"D\",\"retrieval_source\":\"sqlite_cache\"}",
        "created_at": "2026-02-27T10:00:00Z"
      }
    ]
  },
  "error": null
}
```

---

## SQLite Schema

```sql
-- ============================================================
-- File: db/schema.sql
-- Run: sqlite3 emseed.db < db/schema.sql
-- ============================================================

PRAGMA journal_mode=WAL;
PRAGMA foreign_keys=ON;

-- ── EMPLOYEES ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS employees (
    id                       TEXT PRIMARY KEY,
    name                     TEXT NOT NULL,
    disc_type                TEXT NOT NULL
                               CHECK(disc_type IN ('D','I','S','C')),
    language_preference      TEXT NOT NULL DEFAULT 'en',
    communication_preference TEXT
                               CHECK(communication_preference IN (
                                 'direct','collaborative','supportive','analytical'
                               )),
    energy_baseline          INTEGER NOT NULL DEFAULT 70
                               CHECK(energy_baseline BETWEEN 0 AND 100),
    team_id                  TEXT,
    created_at               TEXT NOT NULL
                               DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    updated_at               TEXT NOT NULL
                               DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);

-- ── SIGNALS ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS signals (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id      TEXT    NOT NULL REFERENCES employees(id),
    message_id       TEXT,
    emoji_code       TEXT    NOT NULL,
    resonance_score  INTEGER NOT NULL
                       CHECK(resonance_score BETWEEN 0 AND 100),
    created_at       TEXT NOT NULL
                       DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);

-- ── MESSAGES ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS messages (
    id               TEXT PRIMARY KEY,
    sender_id        TEXT NOT NULL,
    recipient_id     TEXT REFERENCES employees(id),
    team_id          TEXT,
    original_draft   TEXT NOT NULL,
    selected_rewrite TEXT,
    disc_variant     TEXT,
    language         TEXT NOT NULL DEFAULT 'en',
    sent_at          TEXT NOT NULL
                       DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);

-- ── AUDIT LOG ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_log (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    audit_id        TEXT UNIQUE NOT NULL,
    event_type      TEXT NOT NULL
                      CHECK(event_type IN (
                        'mcp_context_call',
                        'rewrite_generated',
                        'kill_switch_engaged',
                        'signal_received',
                        'contagion_alert'
                      )),
    employee_id     TEXT,
    message_id      TEXT,
    payload_summary TEXT,   -- JSON string, NO plaintext PII
    created_at      TEXT NOT NULL
                      DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);

-- ── INDEXES ──────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_signals_employee_id
    ON signals(employee_id);
CREATE INDEX IF NOT EXISTS idx_signals_created_at
    ON signals(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_signals_message_id
    ON signals(message_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient_id
    ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_team_id
    ON messages(team_id);
CREATE INDEX IF NOT EXISTS idx_audit_employee_id
    ON audit_log(employee_id);
CREATE INDEX IF NOT EXISTS idx_audit_event_type
    ON audit_log(event_type);
CREATE INDEX IF NOT EXISTS idx_employees_team_id
    ON employees(team_id);
```

---

## Demo Seed Data

```sql
-- ── SEED: Demo employees for hackathon presentation ──────────
-- Run: sqlite3 emseed.db < db/seed_demo.sql

INSERT OR REPLACE INTO employees VALUES
  ('emp_001', 'Riya',  'D', 'en', 'direct',       80, 'team_alpha',
   strftime('%Y-%m-%dT%H:%M:%SZ','now'), strftime('%Y-%m-%dT%H:%M:%SZ','now')),
  ('emp_002', 'Karan', 'S', 'hi', 'supportive',   45, 'team_alpha',
   strftime('%Y-%m-%dT%H:%M:%SZ','now'), strftime('%Y-%m-%dT%H:%M:%SZ','now')),
  ('emp_003', 'Priya', 'C', 'en', 'analytical',   70, 'team_alpha',
   strftime('%Y-%m-%dT%H:%M:%SZ','now'), strftime('%Y-%m-%dT%H:%M:%SZ','now'));

-- Riya: high resonance history
INSERT INTO signals (employee_id, message_id, emoji_code, resonance_score) VALUES
  ('emp_001', 'msg_demo_01', '✅', 90),
  ('emp_001', 'msg_demo_02', '🔥', 85),
  ('emp_001', 'msg_demo_03', '✅', 90);

-- Karan: declining resonance (will trigger kill-switch in demo)
INSERT INTO signals (employee_id, message_id, emoji_code, resonance_score) VALUES
  ('emp_002', 'msg_demo_01', '🤔', 40),
  ('emp_002', 'msg_demo_02', '😶', 15),
  ('emp_002', 'msg_demo_03', '😶', 15);

-- Priya: moderate stable resonance
INSERT INTO signals (employee_id, message_id, emoji_code, resonance_score) VALUES
  ('emp_003', 'msg_demo_01', '🫂', 75),
  ('emp_003', 'msg_demo_02', '✅', 90),
  ('emp_003', 'msg_demo_03', '🤔', 40);
```

---

## Recommended Tech for P

```
Framework:  FastAPI (Python) — fast to build, auto-generates OpenAPI docs
ORM:        Raw SQLite via sqlite3 module (no ORM needed for this scope)
Server:     Uvicorn
Testing:    pytest + httpx
Run dev:    uvicorn main:app --reload --port 8000
```

```python
# Minimal FastAPI setup (main.py)
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="EmSeed API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],   # React dev server
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import and include routers
from api import employees, signals, teams, alerts, audit
app.include_router(employees.router, prefix="/api")
app.include_router(signals.router,   prefix="/api")
app.include_router(teams.router,     prefix="/api")
app.include_router(alerts.router,    prefix="/api")
app.include_router(audit.router,     prefix="/api")
```

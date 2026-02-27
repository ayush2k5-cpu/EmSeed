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

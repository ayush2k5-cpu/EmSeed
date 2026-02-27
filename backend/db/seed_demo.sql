-- ============================================================
-- File: db/seed_demo.sql
-- Run: sqlite3 emseed.db < db/seed_demo.sql
-- Idempotent: INSERT OR REPLACE ensures no duplicates on repeat runs
-- ============================================================

-- ── EMPLOYEES ────────────────────────────────────────────────
INSERT OR REPLACE INTO employees
    (id, name, disc_type, language_preference, communication_preference, energy_baseline, team_id, created_at, updated_at)
VALUES
    ('emp_001', 'Riya',  'D', 'en', 'direct',     80, 'team_alpha',
     strftime('%Y-%m-%dT%H:%M:%SZ','now'), strftime('%Y-%m-%dT%H:%M:%SZ','now')),
    ('emp_002', 'Karan', 'S', 'hi', 'supportive', 45, 'team_alpha',
     strftime('%Y-%m-%dT%H:%M:%SZ','now'), strftime('%Y-%m-%dT%H:%M:%SZ','now')),
    ('emp_003', 'Priya', 'C', 'en', 'analytical', 70, 'team_alpha',
     strftime('%Y-%m-%dT%H:%M:%SZ','now'), strftime('%Y-%m-%dT%H:%M:%SZ','now'));

-- ── SIGNALS: Delete old demo signals before re-seeding ───────
-- This ensures idempotency for the signals table (no UNIQUE key to replace on)
DELETE FROM signals WHERE message_id IN (
    'msg_demo_01', 'msg_demo_02', 'msg_demo_03'
);

-- Riya (emp_001): High resonance — D archetype, engaged
INSERT INTO signals (employee_id, message_id, emoji_code, resonance_score) VALUES
    ('emp_001', 'msg_demo_01', '✅', 90),
    ('emp_001', 'msg_demo_02', '🔥', 85),
    ('emp_001', 'msg_demo_03', '✅', 90);

-- Karan (emp_002): Declining resonance — will trigger kill-switch in demo
-- Scores: 40 → 15 → 15  (all 3 below threshold of 25)
INSERT INTO signals (employee_id, message_id, emoji_code, resonance_score) VALUES
    ('emp_002', 'msg_demo_01', '🤔', 40),
    ('emp_002', 'msg_demo_02', '😶', 15),
    ('emp_002', 'msg_demo_03', '😶', 15);

-- Priya (emp_003): Moderate stable resonance — C archetype
INSERT INTO signals (employee_id, message_id, emoji_code, resonance_score) VALUES
    ('emp_003', 'msg_demo_01', '🫂', 75),
    ('emp_003', 'msg_demo_02', '✅', 90),
    ('emp_003', 'msg_demo_03', '🤔', 40);

-- ============================================================
-- File: db/seed_demo.sql
-- Run: sqlite3 emseed.db < db/seed_demo.sql
-- Idempotent: INSERT OR REPLACE ensures no duplicates on repeat runs
-- ============================================================

-- ── EMPLOYEES ────────────────────────────────────────────────
INSERT OR REPLACE INTO employees
    (id, name, disc_type, language_preference, communication_preference, energy_baseline, team_id, created_at, updated_at)
VALUES
    ('priyanshu', 'Priyanshu',  'D', 'en', 'direct',     80, 'team_alpha',
     strftime('%Y-%m-%dT%H:%M:%SZ','now'), strftime('%Y-%m-%dT%H:%M:%SZ','now')),
    ('granth', 'Granth', 'S', 'hi', 'supportive', 28, 'team_alpha',
     strftime('%Y-%m-%dT%H:%M:%SZ','now'), strftime('%Y-%m-%dT%H:%M:%SZ','now')),
    ('anika', 'Anika', 'C', 'en', 'analytical', 55, 'team_alpha',
     strftime('%Y-%m-%dT%H:%M:%SZ','now'), strftime('%Y-%m-%dT%H:%M:%SZ','now')),
    ('rahul', 'Rahul', 'I', 'en', 'collaborative', 18, 'team_alpha',
     strftime('%Y-%m-%dT%H:%M:%SZ','now'), strftime('%Y-%m-%dT%H:%M:%SZ','now'));

-- ── SIGNALS: Delete old demo signals before re-seeding ───────
-- This ensures idempotency for the signals table (no UNIQUE key to replace on)
DELETE FROM signals WHERE message_id IN (
    'msg_demo_01', 'msg_demo_02', 'msg_demo_03'
);

-- Priyanshu: High resonance -- D archetype, engaged
INSERT INTO signals (employee_id, message_id, emoji_code, resonance_score) VALUES
    ('priyanshu', 'msg_demo_01', '✅', 90),
    ('priyanshu', 'msg_demo_02', '🔥', 85),
    ('priyanshu', 'msg_demo_03', '✅', 90);

-- Granth: Moderate resonance -- so we can actually see the Sarvam Hindi translation in the UI!
-- Previously this was (22, 15, 15) which triggered the Kill Switch and hid the Hindi rewrites!
INSERT INTO signals (employee_id, message_id, emoji_code, resonance_score) VALUES
    ('granth', 'msg_demo_01', '✅', 90),
    ('granth', 'msg_demo_02', '🫂', 75),
    ('granth', 'msg_demo_03', '🤔', 40);

-- Anika: Moderate stable resonance -- C archetype
INSERT INTO signals (employee_id, message_id, emoji_code, resonance_score) VALUES
    ('anika', 'msg_demo_01', '🫂', 75),
    ('anika', 'msg_demo_02', '✅', 90),
    ('anika', 'msg_demo_03', '🤔', 40);

-- Rahul: Declining resonance -- all 3 signals below kill-switch floor (25)
-- This is used SPECIFICALLY to trigger the Kill-Switch demo!
INSERT INTO signals (employee_id, message_id, emoji_code, resonance_score) VALUES
    ('rahul', 'msg_demo_01', '🤔', 22),
    ('rahul', 'msg_demo_02', '😶', 15),
    ('rahul', 'msg_demo_03', '😶', 15);

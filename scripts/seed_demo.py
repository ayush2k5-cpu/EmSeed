"""
scripts/seed_demo.py
Seeds the demo database with Riya, Karan, Priya.
Idempotent: safe to run multiple times — no duplicate rows created.
"""

import sys
import os

# Ensure we can find db/database.py from project root
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from backend.db.database import get_db, init_db

SEED_SQL_PATH = os.path.join(os.path.dirname(__file__), "..", "backend", "db", "seed_demo.sql")


def seed():
    print("[seed] EmSeed -- running demo seed...")

    # Ensure schema exists first
    init_db()
    print("  [ok] Schema verified")

    conn = get_db()
    with open(SEED_SQL_PATH, "r", encoding="utf-8") as f:
        conn.executescript(f.read())
    conn.commit()

    # Verify
    rows = conn.execute("SELECT id, name, disc_type FROM employees ORDER BY id").fetchall()
    print(f"  [ok] Employees seeded ({len(rows)} rows):")
    for r in rows:
        print(f"      {r['id']} — {r['name']} ({r['disc_type']})")

    signal_count = conn.execute("SELECT COUNT(*) FROM signals").fetchone()[0]
    print(f"  [ok] Signals seeded ({signal_count} rows)")

    conn.close()
    print("[done] Seed complete. DB is ready for demo.")


if __name__ == "__main__":
    seed()

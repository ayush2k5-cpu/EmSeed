"""
db/database.py
Provides get_db() — a WAL-enabled SQLite connection with dict-like row access.
"""

import sqlite3
import os

# Path to the single SQLite file — lives at project root
DB_PATH = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "..", "emseed.db")
)


def get_db() -> sqlite3.Connection:
    """
    Open and return a SQLite connection with:
    - WAL journal mode (safe for concurrent reads)
    - Foreign key enforcement
    - Row factory for dict-like column access
    """
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row          # access columns by name: row["disc_type"]
    conn.execute("PRAGMA journal_mode=WAL;")
    conn.execute("PRAGMA foreign_keys=ON;")
    return conn


def init_db():
    """
    Run schema.sql against the DB — safe to run multiple times (CREATE IF NOT EXISTS).
    Called on app startup from main.py.
    """
    schema_path = os.path.join(os.path.dirname(__file__), "schema.sql")
    conn = get_db()
    with open(schema_path, "r", encoding="utf-8") as f:
        conn.executescript(f.read())
    conn.close()

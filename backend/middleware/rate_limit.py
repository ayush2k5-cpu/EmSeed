"""
Round-robin API key rotator with sliding-window rate limiting.
State is in-memory — resets on server restart (sufficient for 24h hackathon).

Usage:
    from middleware.rate_limit import GROQ_ROTATOR, SARVAM_ROTATOR, GEMINI_ROTATOR

    key = GROQ_ROTATOR.get_key()
    if key is None:
        # all keys exhausted — fall back to mock
        ...
    try:
        GROQ_ROTATOR.record_use(key)
        # ... make API call with key ...
    except RateLimitError:
        GROQ_ROTATOR.mark_rate_limited(key)
        # retry: call get_key() again, it will skip the exhausted key
"""

import os
import time
from collections import deque
from typing import Optional


class KeyRotator:
    def __init__(self, keys: list[str], rpm: int, rph: int):
        self.keys = [k for k in keys if k and not k.startswith("gsk_...") and not k.startswith("sk_...") and not k.startswith("AI...")]
        self.rpm = rpm
        self.rph = rph
        self._minute_windows: dict[str, deque] = {k: deque() for k in self.keys}
        self._hour_windows:   dict[str, deque] = {k: deque() for k in self.keys}
        self._index = 0

    def _purge(self, key: str):
        now = time.time()
        mw, hw = self._minute_windows[key], self._hour_windows[key]
        while mw and now - mw[0] > 60:
            mw.popleft()
        while hw and now - hw[0] > 3600:
            hw.popleft()

    def _available(self, key: str) -> bool:
        self._purge(key)
        return (
            len(self._minute_windows[key]) < self.rpm and
            len(self._hour_windows[key]) < self.rph
        )

    def get_key(self) -> Optional[str]:
        """Returns next available key via round-robin. None if all exhausted."""
        if not self.keys:
            return None
        n = len(self.keys)
        for _ in range(n):
            key = self.keys[self._index % n]
            self._index += 1
            if self._available(key):
                return key
        return None

    def record_use(self, key: str):
        """Call after every successful request."""
        if key in self._minute_windows:
            now = time.time()
            self._minute_windows[key].append(now)
            self._hour_windows[key].append(now)

    def mark_rate_limited(self, key: str):
        """Saturate this key's minute window so it gets skipped."""
        if key in self._minute_windows:
            now = time.time()
            while len(self._minute_windows[key]) < self.rpm:
                self._minute_windows[key].append(now)

    @property
    def has_keys(self) -> bool:
        return len(self.keys) > 0


def _load_keys(*env_vars: str) -> list[str]:
    return [os.getenv(v, "") for v in env_vars]


GROQ_ROTATOR = KeyRotator(
    keys=_load_keys("GROQ_API_KEY_1", "GROQ_API_KEY_2"),
    rpm=int(os.getenv("GROQ_RPM", "10")),
    rph=int(os.getenv("GROQ_RPH", "100")),
)

SARVAM_ROTATOR = KeyRotator(
    keys=_load_keys("SARVAM_API_KEY_1", "SARVAM_API_KEY_2"),
    rpm=int(os.getenv("SARVAM_RPM", "5")),
    rph=int(os.getenv("SARVAM_RPH", "50")),
)

GEMINI_ROTATOR = KeyRotator(
    keys=_load_keys("GEMINI_API_KEY_1", "GEMINI_API_KEY_2"),
    rpm=int(os.getenv("GEMINI_RPM", "15")),
    rph=int(os.getenv("GEMINI_RPH", "1000")),
)

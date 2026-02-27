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
    disc_type: str                        # "D" | "I" | "S" | "C"
    energy_level: int                     # 0-100 (current)
    recent_signals: List[SignalEntry]     # last 7 days
    communication_preference: str        # "direct" | "collaborative" | "supportive" | "analytical"
    language_preference: str             # "en" | "hi" | "te" | "ta" | "kn" | "mr"
    last_message_resonance: Optional[int] = None   # most recent score


@dataclass
class MCPPayload:
    message_id: str = field(default_factory=lambda: str(uuid.uuid4()))
    audit_id: str = field(default_factory=lambda: str(uuid.uuid4()))
    sender_id: str = ""
    recipient_context: Optional[EmployeeContext] = None
    original_draft: str = ""
    retrieval_source: str = "sqlite_cache"   # "gemini_rag" | "sqlite_cache"
    created_at: str = field(default_factory=lambda: datetime.utcnow().isoformat())

"""
models/schemas.py
All Pydantic request and response models for EmSeed API.
"""

from pydantic import BaseModel, Field, field_validator
from typing import Optional, List, Any
from datetime import datetime, timezone


# ── COMMON RESPONSE WRAPPER ───────────────────────────────────

def _now_iso() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


class APIResponse(BaseModel):
    success: bool
    data: Optional[Any] = None
    error: Optional[dict] = None
    timestamp: str = Field(default_factory=_now_iso)


def success_response(data: Any, status_code: int = 200) -> dict:
    return {
        "success": True,
        "data": data,
        "error": None,
        "timestamp": _now_iso(),
    }


def error_response(code: str, message: str) -> dict:
    return {
        "success": False,
        "data": None,
        "error": {"code": code, "message": message},
        "timestamp": _now_iso(),
    }


# ── EMPLOYEE ──────────────────────────────────────────────────

VALID_DISC = {"D", "I", "S", "C"}
VALID_COMM_PREFS = {"direct", "collaborative", "supportive", "analytical"}


class EmployeeCreate(BaseModel):
    id: str
    name: str
    disc_type: str
    language_preference: str = "en"
    communication_preference: Optional[str] = None
    energy_baseline: int = Field(default=70, ge=0, le=100)
    team_id: Optional[str] = None

    @field_validator("disc_type")
    @classmethod
    def validate_disc(cls, v: str) -> str:
        if v not in VALID_DISC:
            raise ValueError(f"disc_type must be one of {VALID_DISC}")
        return v

    @field_validator("communication_preference")
    @classmethod
    def validate_comm_pref(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and v not in VALID_COMM_PREFS:
            raise ValueError(f"communication_preference must be one of {VALID_COMM_PREFS}")
        return v


class EmployeeResponse(BaseModel):
    id: str
    name: str
    disc_type: str
    language_preference: str
    communication_preference: Optional[str]
    energy_baseline: int
    team_id: Optional[str]
    created_at: str


# ── EMPLOYEE CONTEXT (must match Lead's EmployeeContext dataclass in mcp/schema.py) ──

class SignalSummary(BaseModel):
    emoji_code: str
    resonance_score: int
    created_at: str


class EmployeeContext(BaseModel):
    """
    Shape of GET /api/employee/{id}/context response.
    NOTE: Must stay in sync with Lead's EmployeeContext dataclass in mcp/schema.py.
    Verify field names with Lead before Hour 2.
    """
    employee_id: str
    disc_type: str
    energy_level: int
    recent_signals: List[SignalSummary]
    resonance_7day_avg: float
    communication_preference: Optional[str]
    language_preference: str
    last_message_resonance: Optional[int]
    retrieval_source: str = "sqlite_cache"


# ── SIGNAL TAP ────────────────────────────────────────────────

VALID_EMOJIS = {"✅", "🔥", "🫂", "🤔", "😶"}

EMOJI_SCORE_MAP = {
    "✅": 90,
    "🔥": 85,
    "🫂": 75,
    "🤔": 40,
    "😶": 15,
}


class SignalTapRequest(BaseModel):
    employee_id: str
    message_id: str
    emoji_code: str

    @field_validator("emoji_code")
    @classmethod
    def validate_emoji(cls, v: str) -> str:
        if v not in VALID_EMOJIS:
            raise ValueError(f"emoji_code must be one of: {', '.join(VALID_EMOJIS)}")
        return v


class KillSwitchResult(BaseModel):
    status: str                          # "ok" | "kill_switch_engaged"
    employee_id: Optional[str] = None
    reason: Optional[str] = None
    scores: Optional[List[int]] = None
    recommendation: Optional[str] = None
    message: Optional[str] = None


class SignalTapResponse(BaseModel):
    signal_id: int
    employee_id: str
    message_id: str
    emoji_code: str
    resonance_score: int
    created_at: str
    kill_switch_check: KillSwitchResult


# ── TEAM PULSE ────────────────────────────────────────────────

class MemberPulse(BaseModel):
    employee_id: str
    disc_type: str
    resonance_7day_avg: float
    last_resonance: Optional[int]
    last_emoji: Optional[str]
    signal_count: int


class ContagionData(BaseModel):
    contagion_coefficient: float
    affected_count: int
    total_count: int
    alert: bool


class TeamPulseResponse(BaseModel):
    team_id: str
    team_resonance_avg: float
    member_count: int
    members: List[MemberPulse]
    contagion: ContagionData


# ── ALERT CHECK ───────────────────────────────────────────────

class AlertCheckRequest(BaseModel):
    team_id: Optional[str] = None
    employee_id: Optional[str] = None

    @field_validator("team_id", mode="before")
    @classmethod
    def at_least_one(cls, v, info):
        return v  # cross-field validation done in endpoint


class AlertCheckResponse(BaseModel):
    scope: str                               # "employee" | "team"
    employee_id: Optional[str] = None
    team_id: Optional[str] = None
    kill_switch: Optional[KillSwitchResult] = None
    contagion: Optional[ContagionData] = None


# ── AUDIT LOG ─────────────────────────────────────────────────

class AuditEntry(BaseModel):
    id: int
    audit_id: str
    event_type: str
    employee_id: Optional[str]
    message_id: Optional[str]
    payload_summary: Optional[str]
    created_at: str


class AuditLogResponse(BaseModel):
    page: int
    limit: int
    total: int
    entries: List[AuditEntry]


# ── DISC ONBOARDING ───────────────────────────────────────────

class OnboardAnswer(BaseModel):
    question_id: int
    disc_vote: str  # "D" | "I" | "S" | "C"


class OnboardRequest(BaseModel):
    employee_id: str
    name: str
    language_preference: str = "en"
    team_id: Optional[str] = None
    answers: List[OnboardAnswer]

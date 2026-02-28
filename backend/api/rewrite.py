import os
import json
import uuid as _uuid
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional

from backend.mcp.schema import MCPPayload, EmployeeContext
from backend.rag.gemini_retriever import get_employee_context
from backend.engines.groq_engine import generate_rewrites
from backend.engines.sarvam_engine import generate_indic_rewrite
from backend.engines.rlm_engine import check_kill_switch
from backend.db.database import DB_PATH, get_db   # FIX: use absolute path constant

router = APIRouter(tags=["rewrite"])

class RewriteRequest(BaseModel):
    recipient_id: str
    original_draft: str
    sender_id: str = "leader_01"


class RewriteVariant(BaseModel):
    variant: str
    text: str
    reasoning: str


class RewriteResponse(BaseModel):
    success: bool
    data: Optional[dict] = None
    error: Optional[dict] = None


@router.post("/rewrite", response_model=RewriteResponse)
async def rewrite_message(request: RewriteRequest):
    """
    Core pipeline:
    1. Fetch recipient context (SQLite cache)
    2. Check kill-switch / RLM condition
    3. Generate rewrites via Groq
    4. (Optional) Translate one variant via Sarvam if language preference is Hindi
    """
    try:
        # 1. Fetch context — use absolute DB_PATH to avoid CWD dependency
        context = await get_employee_context(
            employee_id=request.recipient_id,
            db_path=DB_PATH,   # FIX: was "./emseed.db" (fragile relative path)
            days=7
        )

        # 2. Check kill-switch directly with recent signals
        signals_list = [{"resonance_score": min(100, max(0, context.energy_level))}]
        if context.recent_signals:
            signals_list = [{"resonance_score": s.resonance_score} for s in context.recent_signals]

        ks_result = check_kill_switch(context.employee_id, signals_list)

        if ks_result.get("status") == "kill_switch_engaged":
            _write_audit(request.recipient_id, None, "kill_switch_engaged",
                         {"reason": ks_result.get("reason"), "scores": ks_result.get("scores")})
            return RewriteResponse(
                success=True,
                data={
                    "kill_switch_engaged": True,
                    "kill_switch_reason": ks_result.get("reason"),
                    "recommendation": ks_result.get("recommendation"),
                    "message": ks_result.get("message"),
                    "rewrites": []
                }
            )

        # 3. Prepare MCP Payload
        payload = MCPPayload(
            sender_id=request.sender_id,
            recipient_context=context,
            original_draft=request.original_draft
        )

        # 4. Generate Rewrites
        rewrites = await generate_rewrites(payload)

        # 5. Sarvam Integration (if language preference is Hindi/Indic)
        if context.language_preference == "hi" and rewrites:
            disc = context.disc_type
            hindi_rewrite = await generate_indic_rewrite(
                original=request.original_draft,
                disc_type=disc,
                language="hi"
            )

            # Replace the matching DISC variant, or the first rewrite if no match
            replaced = False
            for i, rw in enumerate(rewrites):
                if rw["variant"] == disc:
                    rewrites[i] = hindi_rewrite
                    replaced = True
                    break

            if not replaced:
                rewrites[0] = hindi_rewrite

        # 6. MCP Audit — log every context call with audit_id (brief requirement)
        _write_audit(request.recipient_id, payload.message_id, "rewrite_generated",
                     {"disc_type": context.disc_type, "retrieval_source": context.language_preference,
                      "variant_count": len(rewrites), "audit_id": payload.audit_id})

        return RewriteResponse(
            success=True,
            data={
                "kill_switch_engaged": False,
                "rewrites": rewrites
            }
        )

    except ValueError as e:
        # Employee not found
        return RewriteResponse(
            success=False,
            error={"code": "NOT_FOUND", "message": str(e)}
        )
    except Exception as e:
        return RewriteResponse(
            success=False,
            error={"code": "INTERNAL_ERROR", "message": str(e)}
        )

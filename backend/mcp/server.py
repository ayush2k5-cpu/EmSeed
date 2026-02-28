import asyncio
import os
import json
from mcp.server.fastmcp import FastMCP
from typing import Optional

# Import EmSeed backend logic
from backend.rag.gemini_retriever import get_employee_context
from backend.engines.groq_engine import generate_rewrites
from backend.engines.sarvam_engine import generate_indic_rewrite
from backend.engines.rlm_engine import check_kill_switch
from backend.mcp.schema import MCPPayload
from backend.db.database import DB_PATH

# We define the FastMCP server
mcp = FastMCP("EmSeed", dependencies=["fastapi", "pydantic", "mcp"])

@mcp.tool()
async def get_team_member_context(employee_id: str) -> str:
    """
    Retrieve the communication context, DISC profile, and recent engagement levels for an employee.
    Use this tool before writing a message to understand the best approach.
    """
    try:
        context = await get_employee_context(
            employee_id=employee_id,
            db_path=DB_PATH,
            days=7
        )
        
        # Check kill-switch condition
        signals_list = [{"resonance_score": min(100, max(0, context.energy_level))}]
        if context.recent_signals:
            signals_list = [{"resonance_score": s.resonance_score} for s in context.recent_signals]
            
        ks_result = check_kill_switch(context.employee_id, signals_list)
        
        status_info = ""
        if ks_result.get("status") == "kill_switch_engaged":
            status_info = f"\n⚠️ URGENT: KILL SWITCH ENGAGED - {ks_result.get('message')} Do not send a message, talk to them directly."
            
        return (
            f"Employee ID: {context.employee_id}\n"
            f"DISC Type: {context.disc_type}\n"
            f"Energy Level: {context.energy_level}/100\n"
            f"Communication Preference: {context.communication_preference}\n"
            f"Language Preference: {context.language_preference}\n"
            f"Recent Engagements: {len(context.recent_signals)}\n"
            f"Last Message Resonance: {context.last_message_resonance}\n"
            f"{status_info}"
        )
    except ValueError as e:
        return f"Error: {str(e)}"
    except Exception as e:
        return f"Unexpected error retrieving context: {str(e)}"

@mcp.tool()
async def rewrite_message(recipient_id: str, original_draft: str) -> str:
    """
    Rewrite a raw message draft to perfectly match the recipient's DISC profile, communication style, and current energy level.
    """
    try:
        context = await get_employee_context(
            employee_id=recipient_id,
            db_path=DB_PATH,
            days=7
        )
        
        # Kill-switch check
        signals_list = [{"resonance_score": min(100, max(0, context.energy_level))}]
        if context.recent_signals:
            signals_list = [{"resonance_score": s.resonance_score} for s in context.recent_signals]
            
        ks_result = check_kill_switch(context.employee_id, signals_list)
        if ks_result.get("status") == "kill_switch_engaged":
            return f"⚠️ URGENT: KILL SWITCH ENGAGED - {ks_result.get('message')} Do not send a message, talk to them directly."
            
        # Prepare MCP Payload
        payload = MCPPayload(
            sender_id="mcp_user",
            recipient_context=context,
            original_draft=original_draft
        )
        
        # Generate Rewrites
        all_rewrites = await generate_rewrites(payload)
        
        # Filter for the specific employee's DISC variant or take the first
        disc = context.disc_type
        target_rewrite = next((rw for rw in all_rewrites if rw["variant"] == disc), all_rewrites[0])
        
        # Check Indic language
        if context.language_preference == "hi":
            hindi_rewrite = await generate_indic_rewrite(
                original=original_draft,
                disc_type=disc,
                language="hi"
            )
            target_rewrite = hindi_rewrite
            
        # Try to write to audit
        try:
            from backend.api.rewrite import _write_audit
            _write_audit(recipient_id, payload.message_id, "rewrite_generated",
                           {"disc_type": context.disc_type, "retrieval_source": "mcp_cli"})
        except Exception as e:
            pass # ignore audit failure
            
        return (
            f"Rewritten Message for {recipient_id} (DISC: {disc}):\n\n"
            f"{target_rewrite['text']}\n\n"
            f"Reasoning:\n{target_rewrite['reasoning']}"
        )
        
    except ValueError as e:
        return f"Error: {str(e)}"
    except Exception as e:
        return f"Unexpected error rewriting message: {str(e)}"

if __name__ == "__main__":
    # Start the FastMCP server with stdio
    mcp.run(transport='stdio')

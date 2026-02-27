import requests
import asyncio
from typing import Dict

from backend.mcp.schema import MCPPayload, EmployeeContext
from backend.middleware.rate_limit import SARVAM_ROTATOR
from backend.engines.groq_engine import generate_rewrites
from backend.engines.prompts import DISC_PROMPTS

async def generate_indic_rewrite(original: str, disc_type: str, language: str) -> Dict[str, str]:
    MAX_ATTEMPTS = len(SARVAM_ROTATOR.keys) + 1
    
    for attempt in range(MAX_ATTEMPTS):
        key = SARVAM_ROTATOR.get_key()
        if key is None:
            break
            
        try:
            url = "https://api.sarvam.ai/text:generate"
            headers = {
                "api-subscription-key": key,
                "Content-Type": "application/json"
            }
            body = {
                "input": original,
                "source_language_code": language,
                "target_language_code": language,
                "model": "sarvam-m"
            }
            
            # Use asyncio.to_thread for sync requests call
            response = await asyncio.to_thread(
                requests.post,
                url,
                headers=headers,
                json=body
            )
            
            if response.status_code == 429:
                SARVAM_ROTATOR.mark_rate_limited(key)
                continue
                
            response.raise_for_status()
            SARVAM_ROTATOR.record_use(key)
            
            data = response.json()
            return {
                "variant": disc_type,
                "text": data.get("output", original),
                "reasoning": "Indic-personalised rewrite"
            }
            
        except requests.exceptions.HTTPError as e:
            if e.response.status_code == 429:
                SARVAM_ROTATOR.mark_rate_limited(key)
                continue
            else:
                break # other HTTP error, go to fallback
                
        except Exception:
            break # non HTTP error (e.g. connection error), go to fallback
            
    # Fallback if all Sarvam keys exhausted or unavailable
    print("sarvam_fallback: routing to groq")
    
    # Temporarily append instruction to the S variant prompt
    original_s_prompt = DISC_PROMPTS.get("S", "")
    DISC_PROMPTS["S"] = original_s_prompt + "\nNote: The recipient may prefer Hindi. Keep the tone culturally warm and direct."
    
    try:
        fallback_payload = MCPPayload(
            original_draft=original,
            recipient_context=EmployeeContext(
                employee_id="fallback_sarvam",
                disc_type="S",
                energy_level=50,
                recent_signals=[],
                communication_preference="supportive",
                language_preference=language
            )
        )
        
        rewrites = await generate_rewrites(fallback_payload)
        
        if rewrites:
            first_rewrite = rewrites[0]
            # Ensure the returned variant matches what was requested
            first_rewrite["variant"] = disc_type
            first_rewrite["reasoning"] = "Indic-personalised rewrite (Groq fallback)"
            return first_rewrite
            
        return {"variant": disc_type, "text": original, "reasoning": "Indic-personalised rewrite (failed fallback)"}
        
    finally:
        # Restore the prompt
        DISC_PROMPTS["S"] = original_s_prompt


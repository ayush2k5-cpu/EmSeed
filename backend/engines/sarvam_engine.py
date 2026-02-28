import os
import requests
import asyncio
from backend.middleware.rate_limit import SARVAM_ROTATOR
from backend.engines.groq_engine import generate_rewrites
from backend.mcp.schema import MCPPayload, EmployeeContext
from backend.engines.prompts import DISC_PROMPTS


class SarvamRateLimitError(Exception):
    pass


async def generate_indic_rewrite(original: str, disc_type: str, language: str) -> dict:
    MAX_ATTEMPTS = len(SARVAM_ROTATOR.keys) + 1
    for attempt in range(MAX_ATTEMPTS):
        key = SARVAM_ROTATOR.get_key()
        if key is None:
            break

        try:
            SARVAM_ROTATOR.record_use(key)

            headers = {
                "api-subscription-key": key,
                "Content-Type": "application/json"
            }
            # Use the correct Sarvam translation model endpoint
            body = {
                "input": original,
                "source_language_code": "en-IN",
                "target_language_code": "hi-IN",
                "speaker_gender": "Male",
                "mode": "formal",
                "model": "sarvam-translate:v1"
            }

            def _post():
                response = requests.post(
                    "https://api.sarvam.ai/translate",
                    json=body,
                    headers=headers,
                    timeout=15.0
                )
                if response.status_code == 429:
                    raise SarvamRateLimitError()
                response.raise_for_status()
                return response.json()

            data = await asyncio.to_thread(_post)
            text = data.get("output", data.get("translated_text", original))

            return {
                "variant": disc_type,
                "text": text,
                "reasoning": "Indic-personalised rewrite"
            }
        except SarvamRateLimitError:
            SARVAM_ROTATOR.mark_rate_limited(key)
            continue
        except Exception as e:
            print(f"Sarvam API Exception: {type(e).__name__} - {str(e)}")
            if hasattr(e, 'response') and e.response is not None:
                print("Sarvam HTTP Error:", e.response.text)
            break

    print("sarvam_fallback: routing to groq")

    fallback_payload = MCPPayload(
        original_draft=original,
        recipient_context=EmployeeContext(
            employee_id="emp_002",
            disc_type=disc_type,
            energy_level=50,
            recent_signals=[],
            communication_preference="",
            language_preference=language
        )
    )

    base_prompt = DISC_PROMPTS.get(disc_type, DISC_PROMPTS.get("S", ""))
    hindi_prompt = base_prompt + "\nNote: The recipient prefers Hindi. Keep the tone culturally warm and direct."

    fallback_results = await generate_rewrites(fallback_payload, fallback_prompt=hindi_prompt)
    if fallback_results:
        first_result = fallback_results[0]
        return {
            "variant": disc_type,
            "text": first_result.get("text", original),
            "reasoning": "Indic-personalised rewrite (Groq fallback)"
        }

    return {
        "variant": disc_type,
        "text": original,
        "reasoning": "Indic-personalised rewrite (passthrough fallback)"
    }

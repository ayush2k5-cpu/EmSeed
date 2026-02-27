import os
import json
import asyncio
from typing import Optional
from groq import Groq, RateLimitError

from backend.mcp.schema import MCPPayload, EmployeeContext, SignalEntry
from backend.engines.prompts import DISC_PROMPTS, DISC_REASONING
from backend.middleware.rate_limit import GROQ_ROTATOR


def detect_language(text: str) -> str:
    """Check for Devanagari Unicode range \u0900–\u097F in text.
    Return 'hi' if found, 'en' otherwise."""
    for char in text:
        if '\u0900' <= char <= '\u097F':
            return "hi"
    return "en"


def _mock_fallback(employee_id: str) -> list[dict]:
    # Path from backend/: "../frontend/src/mock_data/rewrites.json"
    filepath = os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "src", "mock_data", "rewrites.json")
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            data = json.load(f)
            if employee_id in data:
                return data[employee_id].get("rewrites", [])
            return data.get("emp_002", {}).get("rewrites", [])
    except Exception:
        return []


def _generate_all_variants(client: Groq, variants: list[str], fallback_prompt: Optional[str], user_prompt: str) -> list[dict]:
    rewrites = []
    for variant in variants:
        system_prompt = fallback_prompt if fallback_prompt else DISC_PROMPTS.get(variant, "")
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            temperature=0.7,
            max_tokens=300,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ]
        )
        rewrites.append({
            "variant": variant,
            "text": response.choices[0].message.content.strip(),
            "reasoning": DISC_REASONING.get(variant, "")
        })
    return rewrites


async def generate_rewrites(payload: MCPPayload, fallback_prompt: Optional[str] = None) -> list[dict]:
    if not payload.recipient_context:
        return _mock_fallback("emp_002")
        
    emp_id = payload.recipient_context.employee_id
    disc_type = payload.recipient_context.disc_type
    energy_level = payload.recipient_context.energy_level
    
    mapping = {
        "D": ["D", "I", "S"],
        "I": ["I", "D", "S"],
        "S": ["S", "D", "C"],
        "C": ["C", "D", "I"]
    }
    variants = mapping.get(disc_type, ["D", "I", "S"])
    
    user_prompt = f"Original message: {payload.original_draft}\nRecipient DISC type: {disc_type}\nEnergy level: {energy_level}/100"
    
    MAX_ATTEMPTS = len(GROQ_ROTATOR.keys) + 1
    for attempt in range(MAX_ATTEMPTS):
        key = GROQ_ROTATOR.get_key()
        if key is None:
            return _mock_fallback(emp_id)
        try:
            GROQ_ROTATOR.record_use(key)
            client = Groq(api_key=key)
            rewrites = await asyncio.to_thread(_generate_all_variants, client, variants, fallback_prompt, user_prompt)
            return rewrites
        except RateLimitError:
            GROQ_ROTATOR.mark_rate_limited(key)
            continue
        except Exception:
            return _mock_fallback(emp_id)
            
    return _mock_fallback(emp_id)


if __name__ == "__main__":
    test_payload = MCPPayload(
        sender_id="leader_01",
        original_draft="Karan, we need to wrap this up by Friday.",
        recipient_context=EmployeeContext(
            employee_id="emp_002",
            disc_type="S",
            energy_level=45,
            recent_signals=[
                SignalEntry("🤔", 40, "2026-02-25T10:00:00"),
                SignalEntry("😶", 15, "2026-02-26T10:00:00"),
                SignalEntry("😶", 15, "2026-02-27T10:00:00"),
            ],
            communication_preference="supportive",
            language_preference="hi",
        )
    )
    result = asyncio.run(generate_rewrites(test_payload))
    for r in result:
        print(f"[{r['variant']}] {r['text']}")

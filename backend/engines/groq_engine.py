import os
import json
import asyncio
from typing import List, Dict

from groq import Groq, RateLimitError

from backend.mcp.schema import MCPPayload
from backend.middleware.rate_limit import GROQ_ROTATOR
from backend.engines.prompts import DISC_PROMPTS, DISC_REASONING

CONTRAST_MAP = {
    "D": ["D", "I", "S"],
    "I": ["I", "D", "S"],
    "S": ["S", "D", "C"],
    "C": ["C", "D", "I"]
}

def detect_language(text: str) -> str:
    """
    Check for Devanagari Unicode range \u0900–\u097F in text.
    Return 'hi' if found, 'en' otherwise.
    """
    if any('\u0900' <= char <= '\u097F' for char in text):
        return "hi"
    return "en"

def _mock_fallback(employee_id: str) -> List[Dict[str, str]]:
    """
    Load frontend/src/mock_data/rewrites.json, return the rewrites list for that employee_id.
    If employee_id not found, return rewrites for 'emp_002' (the demo default).
    """
    mock_file_path = os.path.join(
        os.path.dirname(__file__), "..", "..", "frontend", "src", "mock_data", "rewrites.json"
    )
    
    try:
        with open(mock_file_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            emp_data = data.get(employee_id, data.get("emp_002", {}))
            return emp_data.get("rewrites", [])
    except Exception:
        # Failsafe if the mock does not exist
        return [{"variant": "S", "text": "Fallback: Please review this message manually.", "reasoning": "Fallback generation"}]

async def generate_rewrites(payload: MCPPayload) -> List[Dict[str, str]]:
    if not payload.recipient_context:
        return []

    employee_id = payload.recipient_context.employee_id
    disc_type = payload.recipient_context.disc_type
    energy_level = payload.recipient_context.energy_level
    original_draft = payload.original_draft
    
    variants = CONTRAST_MAP.get(disc_type, ["S", "D", "C"])
    rewrites = []
    
    MAX_ATTEMPTS = len(GROQ_ROTATOR.keys) + 1
    
    for attempt in range(MAX_ATTEMPTS):
        key = GROQ_ROTATOR.get_key()
        if key is None:
            return _mock_fallback(employee_id)
            
        try:
            GROQ_ROTATOR.record_use(key)
            client = Groq(api_key=key)
            
            rewrites = []
            for variant in variants:
                system_prompt = DISC_PROMPTS.get(variant, DISC_PROMPTS.get("S", ""))
                
                # Never include employee_id, name, or any other identifiers, only the required text
                user_message = f"Original message: {original_draft}\nRecipient DISC type: {variant}\nEnergy level: {energy_level}/100"
                
                # Make sync call async
                response = await asyncio.to_thread(
                    client.chat.completions.create,
                    model="llama-3.3-70b-versatile",
                    temperature=0.7,
                    max_tokens=300,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_message}
                    ]
                )
                
                rewrite_text = response.choices[0].message.content.strip()
                reasoning = DISC_REASONING.get(variant, "")
                
                rewrites.append({
                    "variant": variant,
                    "text": rewrite_text,
                    "reasoning": reasoning
                })
            
            return rewrites
            
        except RateLimitError:
            GROQ_ROTATOR.mark_rate_limited(key)
            continue
        except Exception:
            return _mock_fallback(employee_id)
            
    return _mock_fallback(employee_id)

if __name__ == "__main__":
    from dotenv import load_dotenv
    load_dotenv()
    
    from backend.mcp.schema import EmployeeContext, SignalEntry
    
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

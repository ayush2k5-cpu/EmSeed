import asyncio
from dotenv import load_dotenv
load_dotenv()
from backend.engines.sarvam_engine import generate_indic_rewrite

async def test():
    print("Testing Sarvam...")
    try:
        res = await generate_indic_rewrite("Hello, we need to finish this report by Friday.", "S", "hi")
        print("Result:", res)
    except Exception as e:
        print("Error:", e)
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    asyncio.run(test())

import asyncio
import asyncpg
import sys

async def main():
    print("Connecting...")
    conn = await asyncpg.connect('postgresql://neondb_owner:npg_Wm0SokRHhp8F@ep-dry-cake-aoti8vb9-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?ssl=require')
    print("Connected.")
    await conn.close()
    print("Closed.")

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "selector":
        if sys.platform == "win32":
            print("Using WindowsSelectorEventLoopPolicy")
            asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(main())

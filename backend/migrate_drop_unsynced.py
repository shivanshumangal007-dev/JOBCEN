"""One-off migration: drop unsynced_data."""
import asyncio
import sys
from sqlalchemy import text
from app.db.session import engine

async def main():
    async with engine.begin() as conn:
        try:
            await conn.execute(text("ALTER TABLE platform_sync_status DROP COLUMN IF EXISTS unsynced_data;"))
            print("Dropped unsynced_data column from platform_sync_status.")
        except Exception as e:
            print(f"Error dropping unsynced_data column: {e}")

    print("Migration completed.")

if __name__ == "__main__":
    if sys.platform == "win32":
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(main())

"""One-off migration: add data_updated column to platform_sync_status table."""
import asyncio
import sys
from sqlalchemy import text
from app.db.session import engine

async def main():
    async with engine.begin() as conn:
        await conn.execute(text("ALTER TABLE platform_sync_status ADD COLUMN IF NOT EXISTS data_updated JSON NULL"))
    print("OK - Column 'data_updated' added to platform_sync_status table successfully.")

if __name__ == "__main__":
    if sys.platform == "win32":
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(main())

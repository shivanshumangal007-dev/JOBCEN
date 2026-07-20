"""One-off migration: add resume and updated_at columns to users table."""
import asyncio
import sys
from sqlalchemy import text
from app.db.session import engine

async def main():
    async with engine.begin() as conn:
        await conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS resume VARCHAR NULL"))
        await conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now()"))
    print("OK - Columns 'resume' and 'updated_at' added to users table successfully.")

if __name__ == "__main__":
    if sys.platform == "win32":
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(main())

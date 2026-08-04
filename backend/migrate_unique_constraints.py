"""One-off migration: add unique constraints for profiles and platform_sync_status."""
import asyncio
import sys
from sqlalchemy import text
from app.db.session import engine

async def main():
    async with engine.begin() as conn:
        # Add unique constraint on profiles.user_id (if not exists)
        await conn.execute(text("""
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM pg_constraint WHERE conname = 'uq_profiles_user_id'
                ) THEN
                    ALTER TABLE profiles ADD CONSTRAINT uq_profiles_user_id UNIQUE (user_id);
                END IF;
            END $$;
        """))

        # Add unique constraint on platform_sync_status (user_id, platform)
        await conn.execute(text("""
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM pg_constraint WHERE conname = 'uq_user_platform'
                ) THEN
                    ALTER TABLE platform_sync_status ADD CONSTRAINT uq_user_platform UNIQUE (user_id, platform);
                END IF;
            END $$;
        """))

    print("OK - Unique constraints added successfully.")

if __name__ == "__main__":
    if sys.platform == "win32":
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(main())

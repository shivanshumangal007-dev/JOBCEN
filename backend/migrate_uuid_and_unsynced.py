"""One-off migration: change integer IDs to UUIDs and add unsynced_data."""
import asyncio
import sys
from sqlalchemy import text
from app.db.session import engine

async def main():
    async with engine.begin() as conn:
        # Add unsynced_data column to platform_sync_status
        try:
            await conn.execute(text("ALTER TABLE platform_sync_status ADD COLUMN unsynced_data JSON;"))
            print("Added unsynced_data column to platform_sync_status.")
        except Exception as e:
            print(f"Skipping adding unsynced_data column (may already exist): {e}")

        # Change id in profiles to UUID
        try:
            await conn.execute(text("""
                ALTER TABLE profiles ADD COLUMN new_id UUID DEFAULT gen_random_uuid();
            """))
            await conn.execute(text("""
                UPDATE profiles SET new_id = gen_random_uuid();
            """))
            await conn.execute(text("""
                ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_pkey CASCADE;
            """))
            await conn.execute(text("""
                ALTER TABLE profiles DROP COLUMN id CASCADE;
            """))
            await conn.execute(text("""
                ALTER TABLE profiles RENAME COLUMN new_id TO id;
            """))
            await conn.execute(text("""
                ALTER TABLE profiles ADD PRIMARY KEY (id);
            """))
            print("Successfully migrated profiles.id to UUID.")
        except Exception as e:
            print(f"Skipping profiles migration (may already be UUID): {e}")

        # Change id in platform_sync_status to UUID
        try:
            await conn.execute(text("""
                ALTER TABLE platform_sync_status ADD COLUMN new_id UUID DEFAULT gen_random_uuid();
            """))
            await conn.execute(text("""
                UPDATE platform_sync_status SET new_id = gen_random_uuid();
            """))
            await conn.execute(text("""
                ALTER TABLE platform_sync_status DROP CONSTRAINT IF EXISTS platform_sync_status_pkey CASCADE;
            """))
            await conn.execute(text("""
                ALTER TABLE platform_sync_status DROP COLUMN id CASCADE;
            """))
            await conn.execute(text("""
                ALTER TABLE platform_sync_status RENAME COLUMN new_id TO id;
            """))
            await conn.execute(text("""
                ALTER TABLE platform_sync_status ADD PRIMARY KEY (id);
            """))
            print("Successfully migrated platform_sync_status.id to UUID.")
        except Exception as e:
            print(f"Skipping platform_sync_status migration (may already be UUID): {e}")

    print("Migration completed.")

if __name__ == "__main__":
    if sys.platform == "win32":
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(main())

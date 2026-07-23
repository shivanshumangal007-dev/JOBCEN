import asyncio
import asyncpg
import os
from dotenv import load_dotenv

load_dotenv()

async def main():
    # asyncpg expects postgres:// not postgresql+asyncpg://
    db_url = os.getenv("DATABASE_URL").replace("postgresql+asyncpg://", "postgres://")
    conn = await asyncpg.connect(db_url)
    try:
        await conn.execute('DROP INDEX IF EXISTS ix_users_username;')
        await conn.execute('CREATE INDEX ix_users_username ON users (username);')
        print("Successfully dropped unique constraint on username and recreated index.")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        await conn.close()

if __name__ == "__main__":
    asyncio.run(main())

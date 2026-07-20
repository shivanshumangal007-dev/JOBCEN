from fastapi import HTTPException
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.db.models.user import User
from app.schemas.user import UserCreate
from app.core.security import get_password_hash
from app.db.session import get_db
import uuid

async def create_user(user: UserCreate, db: AsyncSession):
    hashed_password = get_password_hash(user.password)
    db_user = User(
        email = user.email,
        username = user.username,
        hashed_password = hashed_password,
        is_active = False
    )
    db.add(db_user)
    await db.commit()
    
    return db_user

async def get_user_by_email(email: str, db: AsyncSession):
    result = await db.execute(select(User).where(User.email==email))
    return result.scalars().first()

async def get_user_by_id(user_id: str | uuid.UUID, db: AsyncSession) -> User | None:
    result = await db.execute(select(User).filter(User.id == user_id))
    return result.scalars().first()

async def delete_user(user_id: str | uuid.UUID, db: AsyncSession):
    user = await get_user_by_id(user_id, db)
    if user:
        await db.delete(user)
        await db.commit()
        return {"message": "User deleted successfully"}
    else:
        raise HTTPException(status_code=404, detail="User not found")
    
async def add_user_resume(file_path: str, user_id: str, db: AsyncSession):
    user = await get_user_by_id(user_id, db)
    if user:
        user.resume = file_path
        await db.commit()
        return {"message": "User resume added successfully"}
    else:
        raise HTTPException(status_code=404, detail="User not found")


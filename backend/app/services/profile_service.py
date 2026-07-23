from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.crud.profile import get_current_user_profile


class ProfileService:

    @staticmethod
    async def get_user_profile(user_id: str, db: AsyncSession) -> dict:

        profile_data = await get_current_user_profile(user_id, db)

        if not profile_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Profile not found",
            )

        return profile_data
    
    

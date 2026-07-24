from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.schemas.user import UserBase, UserResponse
from app.services.auth_services import get_current_user
from app.services.auth_services import generate_and_send_otp
from app.api.routes.auth import auth_limiter
from app.db.crud.user import get_user_by_id
from app.db.crud.profile import get_current_user_profile
router = APIRouter(prefix="/profile", tags=["user-profile"])

class MeResponse(BaseModel):
    profile: dict  # Or your UserProfileResponse schema
    user: UserResponse

@router.get("/me", response_model=MeResponse, dependencies=[Depends(auth_limiter)])
async def me(current_user: UserResponse = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    user_profile = await get_current_user_profile(current_user.id, db)

    if not user_profile:
        raise HTTPException(status_code=404, detail="User not found")

    
    return {"profile":user_profile, "user":UserResponse.model_validate(current_user)}

@router.post("/delete-profile", dependencies=[Depends(auth_limiter)])
async def delete_profile(current_user: UserBase = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return await generate_and_send_otp(current_user.email, "delete")


from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.db.crud.user import delete_user
from app.schemas.user import UserBase
from app.services.auth_services import get_current_user
from app.services.auth_services import generate_and_send_otp
from app.api.deps import RedisLimiter
from app.api.routes.auth import auth_limiter


router = APIRouter(prefix="/profile", tags=["user-profile"])



@router.get("/me", response_model=UserBase, dependencies=[Depends(auth_limiter)])
async def me(current_user: UserBase = Depends(get_current_user)):
    return current_user

@router.post("/delete-profile", dependencies=[Depends(auth_limiter)])
async def delete_profile(current_user: UserBase = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return await generate_and_send_otp(current_user.email, "delete")

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.db.crud.user import get_user_by_email, create_user, delete_user
from app.schemas.user import UserCreate, UserResponse, Token, UserAuthenticate, UserBase
from app.services.auth_services import authenticate_user, get_current_user
from app.core.security import create_access_token

router = APIRouter(prefix="/profile", tags=["user-profile"])



@router.get("/me", response_model=UserBase)
async def me(current_user: UserBase = Depends(get_current_user)):
    return current_user

@router.post("/delete-profile")
async def delete_profile(current_user: UserBase = Depends(get_current_user)):
    return await delete_user(current_user.id)
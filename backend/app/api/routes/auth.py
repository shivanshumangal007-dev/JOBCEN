from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.db.crud.user import get_user_by_email, create_user
from app.schemas.user import UserCreate, UserResponse, Token, UserAuthenticate, UserBase
from app.services.auth_services import authenticate_user, get_current_user
from app.core.security import create_access_token

router = APIRouter(prefix="/auth", tags=["authentication"])


@router.post("/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def signup(user: UserCreate, db: AsyncSession = Depends(get_db)):
    existing_user = await get_user_by_email(user.email, db)

    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = await create_user(user, db)
    return new_user

@router.post("/login-testing", response_model=Token)
async def login_testing(form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)):
    user = await authenticate_user(form_data.username, form_data.password, db)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(user.id)
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/login", response_model=Token)
async def login(form_data: UserAuthenticate, db: AsyncSession = Depends(get_db)):
    # Use username if provided, otherwise fallback to email
    identifier = form_data.username if form_data.username else form_data.email
    user = await authenticate_user(identifier, form_data.password, db)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(user.id)
    return {"access_token": access_token, "token_type": "bearer"}


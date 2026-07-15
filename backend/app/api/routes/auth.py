from jwt import decode, PyJWTError
from email import generator
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
import secrets

from app.core.config import settings
from app.db.session import get_db
from app.db.crud.user import get_user_by_email, create_user
from app.schemas.user import UserCreate, UserResponse, Token, UserAuthenticate, UserBase, VerifyOTP
from app.services.auth_services import authenticate_user, get_current_user
from app.core.security import create_access_token
from app.services.auth_services import generate_and_send_otp, verify_otp, create_otp_token
from app.core.utils.email import send_verification_email


router = APIRouter(prefix="/auth", tags=["authentication"])


@router.post("/signup", status_code=status.HTTP_201_CREATED)
async def signup(user: UserCreate, db: AsyncSession = Depends(get_db)):
    existing_user = await get_user_by_email(user.email, db)

    if user.email is None or user.username is None or user.password is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="All fields are required")

    if existing_user:
        await send_verification_email(email=user.email)
        return {"otp_token":  create_otp_token(email=user.email, purpose="register")}

    otp_data = await generate_and_send_otp(email=user.email, purpose="register")
    new_user = await create_user(user=user, db=db)
    return {"otp_token": otp_data["otp_token"]}



@router.post("/login-testing")
async def login_testing(form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)):
    user = await authenticate_user(form_data.username, form_data.password, db)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return await generate_and_send_otp(email=user.email, purpose="login")


@router.post("/login")
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
    
    return await generate_and_send_otp(email=user.email, purpose="login")



@router.post("/verify-otp")
async def verify_otp_entered_by_user(request: VerifyOTP, db: AsyncSession = Depends(get_db)):
    try:
        payload = decode(request.otp_token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email = payload.get("email")
        purpose = payload.get("purpose")
    except PyJWTError:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP token.")
        
    await verify_otp(email=email, purpose=purpose, otp=request.otp, otp_token=request.otp_token)
    user = await get_user_by_email(email, db)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if purpose == "register":
        user.is_active = True
        await db.commit()
        access_token = create_access_token(user.id)
        return {"access_token": access_token, "token_type": "bearer"}
        
    elif purpose == "login":
        if not user.is_active:
            user.is_active = True
        access_token = create_access_token(user.id)
        return {"access_token": access_token, "token_type": "bearer"}
    

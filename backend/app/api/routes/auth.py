from app.core.security import get_password_hash
from jwt import decode, PyJWTError
from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
import os

from app.core.config import settings
from app.db.session import get_db
from app.db.crud.user import get_user_by_email, create_user, delete_user
from app.schemas.user import UserCreate, UserAuthenticate, VerifyOTP, UserForgotPassword
from app.services.auth_services import authenticate_user
from app.core.security import create_access_token, create_refresh_token
from app.services.auth_services import generate_and_send_otp, verify_otp, create_otp_token, generate_and_send_opt_forget_password
from app.core.utils.email import send_verification_email
from app.api.deps import RedisLimiter

router = APIRouter(prefix="/auth", tags=["authentication"])

auth_limiter = RedisLimiter(times=5, seconds=60, group="auth")
otp_limiter = RedisLimiter(times=5, seconds=60,group="otp")

environment = os.getenv("ENVIRONMENT")

@router.post("/signup", status_code=status.HTTP_201_CREATED, dependencies=[Depends(auth_limiter)])
async def signup(user: UserCreate, db: AsyncSession = Depends(get_db)):
    if user.email is None or user.username is None or user.password is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="All fields are required")

    existing_user = await get_user_by_email(user.email, db)

    if existing_user:
        await send_verification_email(email=user.email)
        return {"otp_token":  create_otp_token(email=user.email, purpose="register", remember_me=user.remember_me)}

    await create_user(user=user, db=db)
    otp_data = await generate_and_send_otp(email=user.email, purpose="register", remember_me=user.remember_me)
    return {"otp_token": otp_data["otp_token"]}



@router.post("/login-testing", dependencies=[Depends(auth_limiter)])
async def login_testing(form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)):
    user = await authenticate_user(form_data.username, form_data.password, db)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return await generate_and_send_otp(email=user.email, purpose="login")


@router.post("/login", dependencies=[Depends(auth_limiter)])
async def login(form_data: UserAuthenticate, db: AsyncSession = Depends(get_db)):
   
    identifier = form_data.username if form_data.username else form_data.email
    user = await authenticate_user(identifier, form_data.password, db)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )        
    return await generate_and_send_otp(email=user.email, purpose="login", remember_me=form_data.remember_me)


@router.post("/verify-otp", dependencies=[Depends(otp_limiter)])
async def verify_otp_entered_by_user(response: Response, request: VerifyOTP, db: AsyncSession = Depends(get_db)):
    try:
        payload = decode(request.otp_token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email = payload.get("email")
        purpose = payload.get("purpose")
        remember_me = payload.get("remember_me")

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
        refresh_token = create_refresh_token(user.id)

        if remember_me:
            response.set_cookie(
                key="refresh_token",
                value=refresh_token,
                httponly=True,       # Prevents JavaScript reading the cookie (XSS protection)
                secure=True,         # Requires HTTPS in production
                samesite="lax",      # CSRF protection
                max_age=7 * 24 * 3600 # 7 days in seconds
            )
        
        return {"access_token": access_token, "token_type": "bearer"}
        
    elif purpose == "login":
        if not user.is_active:
            user.is_active = True
            await db.commit()
        access_token = create_access_token(user.id)
        refresh_token = create_refresh_token(user.id)
        if remember_me:
            response.set_cookie(
                key="refresh_token",
                value=refresh_token,
                httponly=True,       # Prevents JavaScript reading the cookie (XSS protection)
                secure=True,         # Requires HTTPS in production
                samesite="lax",      # CSRF protection
                max_age=7 * 24 * 3600 # 7 days in seconds
            )
        return {"access_token": access_token, "token_type": "bearer"}
        
    elif purpose == "delete":
        return await delete_user(user.id, db)

    elif purpose == "forgot_password":
        new_password_hash = payload.get("new_password_hash")
        user.hashed_password = new_password_hash
        await db.commit()
        return {"message": "Password changed successfully"}
        
    else:
        raise HTTPException(status_code=400, detail="Invalid OTP purpose.")
    
@router.post("/refresh")
async def refresh_access_token(request: Request):


    refresh_token = request.cookies.get("refresh_token")

    if not refresh_token:
        raise HTTPException(status_code=401, detail="Refresh token missing")

    try:
        payload = decode(refresh_token, settings.REFRESH_SECRET_KEY, algorithms=[settings.ALGORITHM])
        
        # Verify token type
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid token type")
            
        user_id = payload.get("sub")
        
    except PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token")

    # Issue a new short-lived access token
    new_access_token = create_access_token(subject=user_id)

    return {
        "access_token": new_access_token,
        "token_type": "bearer"
    }

@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie("refresh_token")
    return {"message": "Logged out successfully"}


@router.post("/forgot-password")
async def forgot_password(
    user_data: UserForgotPassword,
    db: AsyncSession = Depends(get_db)

):
    user = await get_user_by_email(email=user_data.email, db=db)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    new_password_hash = get_password_hash(user_data.new_password)

    return await generate_and_send_opt_forget_password(email=user.email, purpose="forgot_password", new_password_hash=new_password_hash)
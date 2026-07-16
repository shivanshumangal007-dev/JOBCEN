from app.core.security import get_password_hash
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from jwt import decode, PyJWTError
import redis.asyncio as aioredis
import secrets

from app.core.security import verify_password
from app.db.session import get_db
from app.core.config import settings
from app.db.crud.user import get_user_by_email, get_user_by_id
from app.schemas.user import TokenData, UserAuthenticate
from app.core.utils.email import send_email_otp
from app.core.security import create_access_token, create_otp_token


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login-testing")
redis_client = aioredis.from_url(settings.REDIS_URL, decode_responses=True)

OTP_EXPIRY_SECONDS = settings.OTP_EXPIRY_SECONDS


async def authenticate_user(email_or_username: str, password: str, db: AsyncSession):
    user_record = await get_user_by_email(email_or_username, db)
    
    if not user_record:
        return False
    if not verify_password(password, user_record.hashed_password):
        return False
    return user_record

async def get_current_user(db: AsyncSession = Depends(get_db), token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            print("no user id")
            raise credentials_exception

        token_data = TokenData(user_id=user_id)
    except PyJWTError:
        print("invalid token")
        raise credentials_exception

    user = await get_user_by_id(token_data.user_id, db)
    if user is None:
        print("user is none")
        raise credentials_exception
    return user

async def generate_and_send_otp(email: str, purpose: str):
    otp_code = "".join(secrets.choice("0123456789") for _ in range(6))
    otp_hash = get_password_hash(otp_code)
    otp_token = create_otp_token(email=email, purpose=purpose)

    redis_key = f"otp:{purpose}:{email}:{otp_token}"

    await redis_client.setex(redis_key, OTP_EXPIRY_SECONDS, otp_hash)

    await send_email_otp(email=email, otp=otp_code, purpose=purpose)

    return {"message": "Verification code dispatched successfully.", "otp_token": otp_token}


async def verify_otp(email: str, purpose: str, otp: str, otp_token: str):
    try:
        payload = decode(otp_token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        if payload.get("email") != email or payload.get("purpose") != purpose:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail="OTP token data mismatch."
            )
    except PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Invalid or expired OTP token."
        )

    redis_key = f"otp:{purpose}:{email}:{otp_token}"

    stored_hash = await redis_client.get(redis_key)

    if not stored_hash:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Verification code has expired or does not exist."
        )
    
    if not verify_password(otp, stored_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Invalid verification code."
        )
    
    await redis_client.delete(redis_key)
    return True

import json
import logging

from app.core.security import get_password_hash
from fastapi import Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from jwt import decode, PyJWTError
import redis.asyncio as aioredis
import secrets

from app.core.security import verify_password
from app.db.session import get_db
from app.core.config import settings
from app.db.crud.user import get_user_by_id, get_user_by_email_or_username
from app.schemas.user import TokenData
from app.core.utils.email import send_email_otp, send_forgot_password_email
from app.core.security import create_otp_token

logger = logging.getLogger(__name__)

redis_client = aioredis.from_url(settings.REDIS_URL, decode_responses=True)

OTP_EXPIRY_SECONDS = settings.OTP_EXPIRY_SECONDS
MAX_OTP_ATTEMPTS = 5

environment = settings.ENVIRONMENT

async def authenticate_user(email_or_username: str, password: str, db: AsyncSession):
    user_record = await get_user_by_email_or_username(email_or_username, db)
    
    if not user_record:
        return False
    if not verify_password(password, user_record.hashed_password):
        return False
    return user_record

async def get_current_user(request: Request, db: AsyncSession = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    token = request.cookies.get("access_token")

    if not token:
        raise credentials_exception

    try:
        payload = decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise credentials_exception

        # Reject refresh tokens being used as access tokens
        if payload.get("type") != "access":
            raise credentials_exception

        token_data = TokenData(user_id=user_id)
    except PyJWTError:
        raise credentials_exception

    user = await get_user_by_id(token_data.user_id, db)
    if user is None:
        raise credentials_exception
    return user

async def generate_and_send_otp(email: str, purpose: str, remember_me: bool = False):
    otp_code = "".join(secrets.choice("0123456789") for _ in range(6))

    if environment == "development":
        otp_code = "123456"
    
    otp_hash = get_password_hash(otp_code)
    otp_token = create_otp_token(email=email, purpose=purpose, remember_me=remember_me)

    redis_key = f"otp:{purpose}:{email}:{otp_token}"

    await redis_client.setex(redis_key, OTP_EXPIRY_SECONDS, otp_hash)

    if environment != "development":
        await send_email_otp(email=email, otp=otp_code, purpose=purpose)

    return {"message": "Verification code dispatched successfully.", "otp_token": otp_token}

async def generate_and_send_opt_forget_password(email: str, purpose: str, new_password_hash: str):
    otp_code = "".join(secrets.choice("0123456789") for _ in range(6))

    if environment == "development":
        otp_code = "123456"
    
    otp_hash = get_password_hash(otp_code)
    # Don't embed new_password_hash in the JWT — store it in Redis instead
    otp_token = create_otp_token(email=email, purpose=purpose)

    redis_key = f"otp:{purpose}:{email}:{otp_token}"

    # Store both the OTP hash and the new password hash together in Redis
    value = json.dumps({"otp_hash": otp_hash, "new_password_hash": new_password_hash})
    await redis_client.setex(redis_key, OTP_EXPIRY_SECONDS, value)

    if environment != "development":
        await send_forgot_password_email(email=email, otp=otp_code)

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

    # --- Brute-force protection: check attempt counter ---
    attempts_key = f"otp_attempts:{otp_token}"
    attempts = await redis_client.get(attempts_key)
    if attempts and int(attempts) >= MAX_OTP_ATTEMPTS:
        # Lock this OTP token — delete the OTP so it can't be used at all
        redis_key = f"otp:{purpose}:{email}:{otp_token}"
        await redis_client.delete(redis_key)
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS, 
            detail="Too many failed attempts. Please request a new verification code."
        )

    redis_key = f"otp:{purpose}:{email}:{otp_token}"
    stored_value = await redis_client.get(redis_key)

    if not stored_value:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Verification code has expired or does not exist."
        )
    
    # For forgot_password, stored_value is JSON with otp_hash + new_password_hash.
    # For all other purposes, stored_value is just the otp_hash string.
    new_password_hash = None
    try:
        data = json.loads(stored_value)
        stored_hash = data["otp_hash"]
        new_password_hash = data.get("new_password_hash")
    except (json.JSONDecodeError, TypeError, KeyError):
        stored_hash = stored_value

    if not verify_password(otp, stored_hash):
        # Increment failed attempt counter
        await redis_client.incr(attempts_key)
        await redis_client.expire(attempts_key, OTP_EXPIRY_SECONDS)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Invalid verification code."
        )
    
    # OTP verified — clean up Redis keys
    await redis_client.delete(redis_key)
    await redis_client.delete(attempts_key)

    # Return the new_password_hash if this was a forgot_password verification
    return {"verified": True, "new_password_hash": new_password_hash}

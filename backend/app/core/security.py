from datetime import datetime, timedelta, timezone
from typing import Any, Union
from jwt import encode, decode, PyJWTError
from passlib.context import CryptContext
from app.core.config import settings
import hashlib
import bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def _prepare_password(password: str) -> bytes:
    """Pre-hash with SHA-256 if >71 bytes so bcrypt never sees >72 bytes."""
    pwd_bytes = password.encode("utf-8")
    if len(pwd_bytes) > 71:
        # SHA-256 hexdigest is always 64 chars = 64 bytes, safe for bcrypt
        pwd_bytes = hashlib.sha256(pwd_bytes).hexdigest().encode("utf-8")
    return pwd_bytes

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(_prepare_password(plain_password), hashed_password.encode("utf-8"))

def get_password_hash(password: str) -> str:
    return bcrypt.hashpw(_prepare_password(password), bcrypt.gensalt()).decode("utf-8")

def create_access_token(subject: Union[str, Any], expires_delta: timedelta = None) -> str:
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode = {"exp": expire, "sub": str(subject)}
    encoded_jwt = encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt
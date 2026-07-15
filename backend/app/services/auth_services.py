from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from jwt import decode, PyJWTError

from app.core.security import verify_password
from app.db.session import get_db
from app.core.config import settings
from app.db.crud.user import get_user_by_email, get_user_by_id
from app.schemas.user import TokenData, UserAuthenticate

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login-testing")


async def authenticate_user(email_or_username: str, password: str, db: AsyncSession = Depends(get_db)):
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


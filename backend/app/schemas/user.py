from pydantic import BaseModel, EmailStr
from datetime import datetime
import uuid

class UserBase(BaseModel):
    username: str | None = None
    email: EmailStr

class UserCreate(UserBase):
    password: str | None = None

class UserAuthenticate(UserBase):
    password: str


class UserResponse(UserBase):
    id: uuid.UUID
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    user_id: str | None = None

class VerifyOTP(BaseModel):
    otp: str
    otp_token: str
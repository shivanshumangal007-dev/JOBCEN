from app.db.session import get_db
from app.db.crud.user import get_user_by_email, create_user
from app.schemas.user import UserCreate
from app.core.security import create_access_token, create_refresh_token

import os
from authlib.integrations.starlette_client import OAuth, OAuthError
from fastapi import APIRouter, Depends, HTTPException, Request, Response
from app.api.deps import RedisLimiter
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

google_oauth = OAuth()

router = APIRouter(prefix="/google-auth", tags=["Google Authentication"])

google_limiter = RedisLimiter(times=10, seconds=60, group="google_auth")


google_oauth.register(
    name="google",
    client_id=os.getenv("GOOGLE_CLIENT_ID"),
    client_secret=os.getenv("GOOGLE_CLIENT_SECRET"),
    server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
    client_kwargs={"scope": "openid email profile"},
)


@router.get("/login/google", dependencies=[Depends(google_limiter)])
async def google_login(request: Request):
    """Step A: Redirect user to Google sign-in."""
    redirect_uri = request.url_for("google_callback")
    return await google_oauth.google.authorize_redirect(request, redirect_uri)


@router.get("/google/callback", dependencies=[Depends(google_limiter)])
async def google_callback(response: Response,request: Request, db: AsyncSession = Depends(get_db)):
    """Step B: Handle Google payload, link account, issue JWT."""
    try:
        token = await google_oauth.google.authorize_access_token(request)
        user_info = token.get("userinfo")
        if not user_info:
            raise HTTPException(status_code=400, detail="Failed to retrieve Google user details.")
    except OAuthError as error:
        raise HTTPException(status_code=400, detail=f"OAuth Handshake Error: {error.error}")

    email = user_info.get("email")
    name = user_info.get("name")

    user = await get_user_by_email(email=email, db=db)

    if not user:
        if not name:
            name = email.split("@")[0]

        user_in = UserCreate(email=email, username=name, password=None)
        user = await create_user(user=user_in, db=db)

    access_token = create_access_token(subject=user.id)
    refresh_token = create_refresh_token(user.id)
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,       # Prevents JavaScript reading the cookie (XSS protection)
        secure=True,         # Requires HTTPS in production
        samesite="lax",      # CSRF protection
        max_age=7 * 24 * 3600 # 7 days in seconds
    )
    
    from fastapi.responses import RedirectResponse
    from app.core.config import settings
    
    # Redirect back to the frontend website
    redirect_url = f"{settings.FRONTEND_URL}/auth-callback?token={access_token}&user_id={user.id}"
    return RedirectResponse(url=redirect_url)


class GoogleTokenPayload(BaseModel):
    id_token: str

@router.post("/google", dependencies=[Depends(google_limiter)])
async def verify_google_token(response: Response,payload: GoogleTokenPayload, db: AsyncSession = Depends(get_db)):
    """Handle id_token sent directly from the frontend React app."""
    try:
        # Collect all valid client IDs (Electron/web + mobile)
        valid_client_ids = [
            cid for cid in [
                os.getenv("GOOGLE_CLIENT_ID"),          # Electron / Web
                os.getenv("GOOGLE_CLIENT_ID_MOBILE"),   # Mobile (Android/iOS)
            ] if cid
        ]

        # Verify signature & claims without audience lock so both clients pass
        id_info = id_token.verify_oauth2_token(
            payload.id_token,
            google_requests.Request(),
            audience=None,  # skip single-audience check
        )

        # Manually enforce audience against our whitelist
        if id_info.get("aud") not in valid_client_ids:
            raise HTTPException(
                status_code=401,
                detail="Token audience does not match any known client ID",
            )
        
        email = id_info.get("email")
        name = id_info.get("name")
        
        if not email:
            raise HTTPException(status_code=400, detail="No email provided by Google")

        # Find or create user
        user = await get_user_by_email(db, email)
        if not user:
            if not name:
                name = email.split("@")[0]
            user_in = UserCreate(
                email=email,
                username=name,
                password=None
            )
            user = await create_user(user=user_in, db=db)
            
        # Generate our own JWT access token
        access_token = create_access_token(user.id)
        refresh_token = create_refresh_token(user.id)
        response.set_cookie(
            key="refresh_token",
            value=refresh_token,
            httponly=True,       # Prevents JavaScript reading the cookie (XSS protection)
            secure=True,         # Requires HTTPS in production
            samesite="lax",      # CSRF protection
            max_age=7 * 24 * 3600 # 7 days in seconds
        )
        return {"access_token": access_token, "token_type": "bearer", "user_id": str(user.id), "refresh_token": refresh_token}
        
    except ValueError:
        # Invalid token
        raise HTTPException(status_code=401, detail="Invalid Google token")
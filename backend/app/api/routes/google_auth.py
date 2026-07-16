from app.db.session import get_db
from app.db.crud.user import get_user_by_email, create_user
from app.schemas.user import UserCreate
from app.core.security import create_access_token

import os
from authlib.integrations.starlette_client import OAuth, OAuthError
from fastapi import APIRouter, Depends, HTTPException, Request
from app.api.deps import RedisLimiter
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

google_oauth = OAuth()

router = APIRouter(prefix="/google-auth", tags=["google-authentication"])

google_limiter = RedisLimiter(times=10, seconds=60, group="google_auth")


google_oauth.register(
    name="google",
    client_id=os.getenv("GOOGLE_CLIENT_ID"),
    client_secret=os.getenv("GOOGLE_CLIENT_SECRET"),
    server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
    client_kwargs={"scope": "openid email profile"},
)


@router.get("/login/google", tags=["Google Authentication"], dependencies=[Depends(google_limiter)])
async def google_login(request: Request):
    """Step A: Redirect user to Google sign-in."""
    redirect_uri = request.url_for("google_callback")
    return await google_oauth.google.authorize_redirect(request, redirect_uri)


@router.get("/google/callback", tags=["Google Authentication"], dependencies=[Depends(google_limiter)])
async def google_callback(request: Request, db: AsyncSession = Depends(get_db)):
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
    deep_link = f"realitylens://auth-callback?token={access_token}&user_id={user.id}"

    # Serve an intermediary HTML page that attempts the deep link and provides
    # fallback options (click-to-open button + copy token) for platforms like
    # Linux where custom protocol handlers are unreliable.
    from fastapi.responses import HTMLResponse
    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>RealityLens – Signing you in…</title>
  <style>
    * {{ margin:0; padding:0; box-sizing:border-box; }}
    body {{ font-family: -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;
           display:flex; align-items:center; justify-content:center; min-height:100vh;
           background:linear-gradient(135deg,#0f0c29,#302b63,#24243e); color:#e0e0e0; }}
    .card {{ background:rgba(255,255,255,.06); backdrop-filter:blur(12px);
             border:1px solid rgba(255,255,255,.12); border-radius:16px;
             padding:48px 40px; max-width:440px; text-align:center; }}
    h1 {{ font-size:22px; margin-bottom:8px; color:#fff; }}
    .sub {{ color:#aaa; margin-bottom:28px; font-size:14px; }}
    .spinner {{ width:40px; height:40px; margin:0 auto 24px;
               border:3px solid rgba(255,255,255,.15); border-top-color:#00e5ff;
               border-radius:50%; animation:spin .8s linear infinite; }}
    @keyframes spin {{ to {{ transform:rotate(360deg); }} }}
    a.btn {{ display:inline-block; padding:12px 32px; border-radius:8px;
             background:linear-gradient(135deg,#00e5ff,#7c4dff); color:#fff;
             text-decoration:none; font-weight:600; font-size:15px;
             transition:opacity .2s; }}
    a.btn:hover {{ opacity:.85; }}
    .fallback {{ margin-top:28px; font-size:13px; color:#888; }}
    .token-box {{ margin-top:10px; background:rgba(0,0,0,.3); border:1px solid rgba(255,255,255,.1);
                  border-radius:8px; padding:10px 14px; word-break:break-all;
                  font-family:monospace; font-size:12px; color:#ccc;
                  max-height:80px; overflow-y:auto; user-select:all; cursor:text; }}
    .copy-btn {{ margin-top:8px; padding:6px 16px; border:1px solid rgba(255,255,255,.2);
                 border-radius:6px; background:transparent; color:#aaa; font-size:12px;
                 cursor:pointer; transition:color .2s,border-color .2s; }}
    .copy-btn:hover {{ color:#fff; border-color:rgba(255,255,255,.4); }}
    #status {{ margin-top:16px; font-size:13px; color:#4caf50; min-height:20px; }}
  </style>
</head>
<body>
  <div class="card">
    <div class="spinner" id="spinner"></div>
    <h1>Opening RealityLens…</h1>
    <p class="sub">If the app doesn't open automatically, click the button below.</p>
    <a class="btn" href="{deep_link}" id="open-btn">Open RealityLens</a>
    <p id="status"></p>
    <div class="fallback">
      <p>Still not working? Copy the token and paste it in the app:</p>
      <div class="token-box" id="token">{access_token}</div>
      <button class="copy-btn" onclick="copyToken()">Copy Token</button>
    </div>
  </div>
  <script>
    // 1. Try to fetch the local HTTP server running in the Electron app (fixes Linux AppImage)
    fetch('http://127.0.0.1:13456/ping')
      .then(function() {{
        // If the ping succeeds, the local server is running! Redirect there.
        window.location.href = "http://127.0.0.1:13456/callback?token={access_token}&user_id={user.id}";
      }})
      .catch(function() {{
        // 2. If it fails (mobile, or server not running), fallback to the original deep link
        setTimeout(function() {{
          window.location.href = "{deep_link}";
        }}, 500);
      }});

    function copyToken() {{
      var t = document.getElementById('token').textContent;
      navigator.clipboard.writeText(t).then(function() {{
        document.getElementById('status').textContent = '✓ Token copied to clipboard';
      }});
    }}
  </script>
</body>
</html>"""
    return HTMLResponse(content=html)


class GoogleTokenPayload(BaseModel):
    id_token: str

@router.post("/google", tags=["Google Authentication"], dependencies=[Depends(google_limiter)])
async def verify_google_token(payload: GoogleTokenPayload, db: AsyncSession = Depends(get_db)):
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
        access_token = create_access_token(subject=user.id)
        return {"access_token": access_token, "token_type": "bearer", "user_id": str(user.id)}
        
    except ValueError:
        # Invalid token
        raise HTTPException(status_code=401, detail="Invalid Google token")
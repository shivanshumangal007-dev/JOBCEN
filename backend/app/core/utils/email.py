import httpx
from fastapi import HTTPException, status
from app.core.config import settings

BREVO_API_URL = "https://api.brevo.com/v3/smtp/email"


async def send_email_otp(email: str, otp: str, purpose):
    headers = {
        "accept": "application/json",
        "api-key": settings.BREVO_API_KEY,
        "content-type": "application/json"
    }
    
    # Customize copy based on the purpose
    action_text = {
        "register": "creating your account",
        "login": "logging into your profile",
        "delete": "deleting your account"
    }.get(purpose, "verifying your identity")

    payload = {
        "sender": {"name": settings.BREVO_SENDER_NAME, "email": settings.BREVO_SENDER_EMAIL},
        "to": [{"email": email}],
        "subject": f"Your Verification Code - {otp}",
        "htmlContent": f"""
            <h3>Universal Profile Security</h3>
            <p>You requested an OTP for <strong>{action_text}</strong>.</p>
            <p>Your 6-digit verification code is:</p>
            <h2 style='color: #4F46E5; letter-spacing: 2px;'>{otp}</h2>
            <p>This code will expire in 10 minutes. If you did not request this, please ignore this email.</p>
        """
    }

    async with httpx.AsyncClient() as client:
        response = await client.post(BREVO_API_URL, headers=headers, json=payload)
        
        if response.status_code != 201:
            # Log the error internally
            print(f"Brevo API Error: {response.text}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to send verification email via Brevo."
            )
            
    return True


async def send_verification_email(email: str):
    headers = {
        "accept": "application/json",
        "api-key": settings.BREVO_API_KEY,
        "content-type": "application/json"
    }
    
    # Customize copy based on the purpose
    payload = {
        "sender": {"name": settings.BREVO_SENDER_NAME, "email": settings.BREVO_SENDER_EMAIL},
        "to": [{"email": email}],
        "subject": f"Activity Verification",
        "htmlContent": f"""
            <div style="font-family: Arial, sans-serif; color: #333;">
                <h3>Activity on your JOBCEN Account</h3>
                <p>We received a request to sign up for a JOBCEN account using this email address.</p>
                <p><strong>However, an account with this email already exists.</strong></p>
                <p>If this was you, please <a href="https://yourdomain.com/login" style="color: #4F46E5;">login here</a>.</p>
                <p>If you forgot your password, you can <a href="https://yourdomain.com/forgot-password" style="color: #4F46E5;">click here to reset it</a>.</p>
                <p style="font-size: 0.9em; color: #777;">If you did not make this request, you can safely ignore this email.</p>
            </div>
        """
    }

    async with httpx.AsyncClient() as client:
        response = await client.post(BREVO_API_URL, headers=headers, json=payload)
        
        if response.status_code != 201:
            # Log the error internally
            print(f"Brevo API Error: {response.text}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to send verification email via Brevo."
            )
            
    return True

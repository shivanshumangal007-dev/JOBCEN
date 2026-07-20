from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    REDIS_URL: str = "redis://localhost:6379/0"

    DATABASE_URL: str = "postgresql+asyncpg://user:password@localhost/dbname"
    SECRET_KEY: str = "SUPER_SECRET_RANDOM_STRING_CHANGE_THIS_IN_PRODUCTION"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    BREVO_API_KEY: str = "xkeysib-your-long-api-key-here"
    BREVO_SENDER_EMAIL: str = "no-reply@yourdomain.com"
    BREVO_SENDER_NAME: str = "Universal Profile"

    OTP_EXPIRY_SECONDS: int = 600

    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""
    
    GEMINI_API_KEY: str = ""

    CLOUDINARY_API_KEY: str = ""
    CLOUDINARY_API_SECRET: str = ""
    CLOUDINARY_CLOUD_NAME: str = ""

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
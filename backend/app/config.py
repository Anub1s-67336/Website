"""
Application configuration loaded from environment variables.
Uses python-dotenv to read a .env file when available.
"""
import os
from dotenv import load_dotenv

# load environment variables from a .env file if present
load_dotenv()

class Settings:
    # general
    ENV: str = os.getenv("ENV", "development")  # "production" or "development"

    # security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "change-this-secret-in-production")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

    # database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./app.db")

    # CORS / frontend
    # comma-separated list of allowed origins
    FRONTEND_ORIGINS: list[str] = os.getenv(
        "FRONTEND_ORIGINS",
        "http://localhost:3000,http://localhost:5173",
    ).split(",")


settings = Settings()

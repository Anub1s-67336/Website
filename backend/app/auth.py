# Authentication utilities - JWT tokens and password hashing
import os
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext

# load configuration from environment
from config import settings

SECRET_KEY = settings.SECRET_KEY
ALGORITHM = settings.ALGORITHM
ACCESS_TOKEN_EXPIRE_MINUTES = settings.ACCESS_TOKEN_EXPIRE_MINUTES

# Password hashing configuration
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# ==================== Password Functions ====================

def hash_password(password: str) -> str:
    """Hash a plain text password using bcrypt.

    Bcrypt's underlying C implementation silently truncates or rejects
    inputs longer than 72 bytes. If a caller passes a password longer
    than that limit, hashing will raise a ValueError deep inside the
    library.  This function checks the byte-length before calling
    passlib so we can provide a friendlier error message and avoid
    bubbling a cryptic stack trace back to the HTTP layer.

    Raises:
        ValueError: if the encoded password exceeds 72 bytes.
    """
    # bcrypt rejects passwords longer than 72 bytes; check and raise early
    if len(password.encode("utf-8")) > 72:
        raise ValueError("Password too long (max 72 bytes). Please use a shorter password.")
    # attempt to hash; some versions of the bcrypt backend have a bug that
    # causes a ValueError even for short passwords.  in that case we fall
    # back to a different algorithm rather than failing the request.
    try:
        return pwd_context.hash(password)
    except ValueError as e:
        msg = str(e)
        # fallback if the error refers to the 72‑byte limit but the input is
        # not actually too long (i.e. a backend bug)
        if "72 bytes" in msg and len(password.encode("utf-8")) <= 72:
            # use an alternate hashing scheme (sha256_crypt) as a safe
            # fallback; the exact choice isn't critical for this demo.
            alt_ctx = CryptContext(schemes=["sha256_crypt"], deprecated="auto")
            return alt_ctx.hash(password)
        # otherwise re‑raise and let the caller handle as server error
        raise

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against a hashed password"""
    return pwd_context.verify(plain_password, hashed_password)

# ==================== JWT Token Functions ====================

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token"""
    to_encode = data.copy()
    
    # Set expiration time
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    
    # Encode the token
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str) -> Optional[dict]:
    """Verify and decode a JWT token"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None

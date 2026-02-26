# Main FastAPI application
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer
from starlette.requests import Request
from sqlalchemy.orm import Session
from datetime import timedelta

# Import database and models
from database import engine, get_db, Base
from models import User
import models

# Import configuration, authentication, and CRUD
from config import settings
from auth import create_access_token, verify_token
import crud
from schemas import (
    UserRegister, UserLogin, UserResponse, TokenResponse,
    LessonCreate, LessonResponse,
    UserProgressCreate, UserProgressResponse, LessonProgressResponse
)

# Create database tables
Base.metadata.create_all(bind=engine)

# Initialize FastAPI app
app = FastAPI(title="Learning Platform API", version="1.0.0")

# ==================== CORS Configuration ====================
# Allow requests from configured frontend origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.FRONTEND_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST"],  # restrict to needed methods
    allow_headers=["*"],
)

# ==================== Error handling ====================
from fastapi import Request
from fastapi.responses import JSONResponse

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    # return consistent JSON structure for HTTP errors
    return JSONResponse({"detail": exc.detail}, status_code=exc.status_code)

@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    # avoid leaking internal details
    return JSONResponse({"detail": "Internal server error"}, status_code=500)

# ==================== Authentication ====================
# Security scheme for JWT tokens
security = HTTPBearer()

async def get_current_user(request: Request, db: Session = Depends(get_db)) -> User:
    """
    Dependency to get the current authenticated user.
    This is used to protect routes that require authentication.
    """
    # Extract token from Authorization header
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid authorization header",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = auth_header.split(" ")[1]
    
    # Verify the token
    payload = verify_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Get user ID from token
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Get user from database
    user = crud.get_user_by_id(db, int(user_id))
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return user

# ==================== Health Check ====================

@app.get("/")
def read_root():
    """Health check endpoint"""
    return {"message": "Welcome to Learning Platform API"}

# ==================== User Endpoints ====================

@app.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user: UserRegister, db: Session = Depends(get_db)):
    """
    Register a new user.

    This endpoint validates the request and delegates most checks to the
    CRUD layer.  If the client submits invalid data (duplicate username,
    duplicate email, a password longer than bcrypt's 72-byte limit, or
    even a failure inside the hashing library) a ``ValueError`` is raised
    internally and caught here.  The response in that case will be a 400
    status with JSON:

        {"detail": "<error message>"}

    On success the newly created user record is returned (password is
    never included) and the HTTP status code is 201 Created.

    - **username**: Unique username
    - **email**: Valid email address
    - **password**: Plain text password (will be hashed)
    """
    # Ensure password byte-length fits bcrypt limit (72 bytes)
    if len(user.password.encode("utf-8")) > 72:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password too long (max 72 bytes). Choose a shorter password."
        )

    # attempt creation with centralized validations in CRUD layer
    # only ClientError exceptions represent genuine client mistakes
    # (duplicate username/email).  We intentionally avoid catching
    # generic ValueError so that unexpected failures (e.g. bcrypt bugs)
    # propagate as 500 errors.
    try:
        db_user = crud.create_user(db, user)
    except crud.ClientError as ce:
        # convert known client-side errors into 400 responses
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ce))

    return db_user

@app.post("/login", response_model=TokenResponse)
def login(user_credentials: UserLogin, db: Session = Depends(get_db)):
    """
    User login endpoint.
    Returns a JWT access token if credentials are valid.
    """
    # Authenticate user
    user = crud.authenticate_user(db, user_credentials.email, user_credentials.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id)},
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@app.get("/users/me", response_model=UserResponse)
def get_current_user_info(current_user: User = Depends(get_current_user)):
    """
    Get current authenticated user's information.
    Protected route - requires valid JWT token.
    """
    return current_user

# ==================== Lesson Endpoints ====================

@app.get("/lessons", response_model=list[LessonResponse])
def get_lessons(db: Session = Depends(get_db)):
    """Get all available lessons"""
    return crud.get_all_lessons(db)

@app.post("/lessons", response_model=LessonResponse)
def create_lesson_endpoint(lesson: LessonCreate, db: Session = Depends(get_db)):
    """
    Create a new lesson.
    (In production, you might want to protect this with admin-only access)
    """
    return crud.create_lesson(db, lesson)

# ==================== Progress Endpoints ====================

@app.post("/progress/{lesson_id}", response_model=UserProgressResponse)
def mark_lesson_complete(
    lesson_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Mark a lesson as completed for the current user.
    Protected route - requires valid JWT token.
    """
    # Check if lesson exists
    lesson = crud.get_lesson_by_id(db, lesson_id)
    if not lesson:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lesson not found"
        )
    
    # Create or update progress
    progress = crud.create_or_update_progress(db, current_user.id, lesson_id)
    return progress

@app.get("/progress", response_model=list[LessonProgressResponse])
def get_user_progress(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all lessons with completion status for the current user.
    Protected route - requires valid JWT token.
    """
    return crud.get_user_lessons_with_progress(db, current_user.id)

# ==================== Run Information ====================
if __name__ == "__main__":
    print("Run the server with: uvicorn main:app --reload")

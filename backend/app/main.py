# Main FastAPI application
from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer
from starlette.requests import Request
from sqlalchemy.orm import Session
from datetime import timedelta
import traceback
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Import database and models
from .database import engine, get_db, Base, verify_schema, SessionLocal
from .models import User, Achievement, UserAchievement  # noqa: F401 — registers ORM metadata

# Import configuration, authentication, and CRUD
from .config import settings
from .auth import create_access_token, verify_token
from . import crud

# AI routers
from .routers import chat as chat_router
from .routers import quiz as quiz_router
from .routers import physics as physics_router
from .schemas import (
    UserRegister, UserLogin, UserResponse, TokenResponse,
    LessonCreate, LessonResponse,
    UserProgressCreate, UserProgressResponse, LessonProgressResponse,
    UserProgressUpdateRequest,
    AchievementOut, UnseenAchievementsResponse, GrantAchievementResponse,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Run DB setup on startup; nothing special on shutdown."""
    try:
        verify_schema()
    except Exception as _e:
        logger.warning("verify_schema() failed (non-fatal): %s", _e)
    Base.metadata.create_all(bind=engine)
    # Seed achievement catalogue (idempotent — only runs if table is empty)
    db = SessionLocal()
    try:
        crud.seed_achievements(db)
        crud.seed_physics_achievements(db)
        crud.seed_physics_lessons(db)
    finally:
        db.close()
    logger.info("Database tables ready.")
    yield


# Initialize FastAPI app
app = FastAPI(title="Learning Platform API", version="1.0.0", lifespan=lifespan)

# AI feature routers
app.include_router(chat_router.router)
app.include_router(quiz_router.router)
app.include_router(physics_router.router)

# ==================== CORS Configuration ====================
# Wildcard origins for development — no credentials mode needed since
# we use JWT in the Authorization header, not cookies.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==================== Error handling ====================
from fastapi import Request
from fastapi.responses import JSONResponse

CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "*",
}

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        {"detail": exc.detail},
        status_code=exc.status_code,
        headers=CORS_HEADERS,
    )

@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    # Print full traceback to the backend terminal for debugging
    logger.error("UNHANDLED EXCEPTION on %s %s", request.method, request.url.path)
    logger.error(traceback.format_exc())
    return JSONResponse(
        {"detail": f"Internal server error: {type(exc).__name__}: {exc}"},
        status_code=500,
        headers=CORS_HEADERS,
    )

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
    # All validation (including 72-byte limit) is handled inside crud.create_user
    # and surfaces as ClientError → 400.
    try:
        db_user = crud.create_user(db, user)
    except crud.ClientError as ce:
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


@app.patch("/users/me/progress", response_model=UserResponse)
def update_my_progress(
    data: UserProgressUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Update XP and/or medals for the current user.
    - xp_delta: add N to current XP
    - xp_total: set XP to absolute value
    - medals: replace medals list
    Protected route - requires valid JWT token.
    """
    try:
        updated = crud.update_user_xp_medals(
            db,
            current_user.id,
            xp_delta=data.xp_delta or 0,
            xp_total=data.xp_total,
            medals=data.medals,
        )
    except crud.ClientError as ce:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ce))
    return updated

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

# ==================== Achievement Endpoints ====================

@app.post(
    "/users/me/achievements/{achievement_id}",
    response_model=GrantAchievementResponse,
    status_code=status.HTTP_200_OK,
)
def earn_achievement(
    achievement_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Grant an achievement to the current user.
    Idempotent — repeated calls are safe (granted=False if already owned).
    Also auto-grants XP milestone achievements.
    """
    result = crud.grant_achievement(db, current_user.id, achievement_id)
    crud.check_xp_milestones(db, current_user.id)
    return GrantAchievementResponse(
        granted=result is not None,
        achievement_id=achievement_id,
    )


@app.get("/users/me/achievements", response_model=list[AchievementOut])
def get_my_achievements(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Return all achievements earned by the current user."""
    return crud.get_user_achievements(db, current_user.id)


@app.get("/users/me/achievements/unseen", response_model=UnseenAchievementsResponse)
def get_unseen_achievements(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Return achievements that haven't been shown as a popup yet."""
    items = crud.get_unseen_achievements(db, current_user.id)
    return UnseenAchievementsResponse(achievements=items)


@app.post("/users/me/achievements/seen", status_code=status.HTTP_204_NO_CONTENT)
def mark_achievements_seen(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Mark all unseen achievements as seen (called after toast is shown)."""
    crud.mark_achievements_seen(db, current_user.id)


# ==================== Run Information ====================
if __name__ == "__main__":
    import os
    import uvicorn

    # Railway sets $PORT; fallback to 8000 for local run.
    port = int(os.environ.get("PORT", "8000"))
    print(f"Starting server on 0.0.0.0:{port}")
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=port)

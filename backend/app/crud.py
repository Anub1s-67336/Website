# CRUD operations - Database Create, Read, Update, Delete operations
from sqlalchemy.orm import Session
from sqlalchemy import func
from models import User, Lesson, UserProgress
from schemas import UserRegister, LessonCreate
from auth import hash_password, verify_password
from datetime import datetime

# ==================== User Operations ====================

def create_user(db: Session, user: UserRegister) -> User:
    """Create a new user in the database"""
    # Hash the password before saving
    hashed_password = hash_password(user.password)
    
    # Create new user object
    db_user = User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_password
    )
    
    # Save to database
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_user_by_email(db: Session, email: str) -> User:
    """Get a user by email address"""
    return db.query(User).filter(User.email == email).first()

def get_user_by_username(db: Session, username: str) -> User:
    """Get a user by username"""
    return db.query(User).filter(User.username == username).first()

def get_user_by_id(db: Session, user_id: int) -> User:
    """Get a user by ID"""
    return db.query(User).filter(User.id == user_id).first()

def authenticate_user(db: Session, email: str, password: str) -> User:
    """Authenticate user with email and password"""
    user = get_user_by_email(db, email)
    
    # Check if user exists and password is correct
    if not user or not verify_password(password, user.hashed_password):
        return None
    
    return user

# ==================== Lesson Operations ====================

def create_lesson(db: Session, lesson: LessonCreate) -> Lesson:
    """Create a new lesson"""
    db_lesson = Lesson(
        title=lesson.title,
        description=lesson.description
    )
    db.add(db_lesson)
    db.commit()
    db.refresh(db_lesson)
    return db_lesson

def get_all_lessons(db: Session) -> list:
    """Get all lessons"""
    return db.query(Lesson).all()

def get_lesson_by_id(db: Session, lesson_id: int) -> Lesson:
    """Get a lesson by ID"""
    return db.query(Lesson).filter(Lesson.id == lesson_id).first()

# ==================== Progress Operations ====================

def create_or_update_progress(db: Session, user_id: int, lesson_id: int) -> UserProgress:
    """Mark a lesson as completed for a user"""
    # Check if progress record already exists
    progress = db.query(UserProgress).filter(
        UserProgress.user_id == user_id,
        UserProgress.lesson_id == lesson_id
    ).first()
    
    if progress:
        # Update existing record
        progress.completed = True
        progress.completed_at = datetime.utcnow()
    else:
        # Create new record
        progress = UserProgress(
            user_id=user_id,
            lesson_id=lesson_id,
            completed=True,
            completed_at=datetime.utcnow()
        )
        db.add(progress)
    
    db.commit()
    db.refresh(progress)
    return progress

def get_user_progress(db: Session, user_id: int) -> list:
    """Get all progress records for a user"""
    return db.query(UserProgress).filter(UserProgress.user_id == user_id).all()

def get_user_lessons_with_progress(db: Session, user_id: int) -> list:
    """Get all lessons with completion status for a user"""
    lessons = db.query(Lesson).all()
    result = []
    
    for lesson in lessons:
        # Check if user has completed this lesson
        progress = db.query(UserProgress).filter(
            UserProgress.user_id == user_id,
            UserProgress.lesson_id == lesson.id
        ).first()
        
        result.append({
            "id": lesson.id,
            "title": lesson.title,
            "description": lesson.description,
            "completed": progress.completed if progress else False
        })
    
    return result

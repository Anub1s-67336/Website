# CRUD operations - Database Create, Read, Update, Delete operations
from sqlalchemy.orm import Session
from sqlalchemy import func
from .models import User, Lesson, UserProgress, Achievement, UserAchievement
from .schemas import UserRegister, LessonCreate
from .auth import hash_password, verify_password
from datetime import datetime
from typing import Optional, List
import json

# custom exception type for request validation errors
class ClientError(Exception):
    """Raised by CRUD functions when input from the client is invalid.

    This allows the HTTP layer to distinguish between genuine client
    mistakes (duplicate username/email, password length, etc.) and
    unexpected server-side faults such as database outages or
    hashing library bugs.
    """
    pass

# ==================== User Operations ====================

def create_user(db: Session, user: UserRegister) -> User:
    """Create a new user in the database.

    This function performs minimal validation and raises ValueError on
    problems so that the HTTP layer can convert them into 400 responses.
    Caller should catch and translate the exception.
    """
    # duplicates are easier to detect at the CRUD level as well
    if get_user_by_username(db, user.username):
        raise ClientError("Username already registered")
    if get_user_by_email(db, user.email):
        raise ClientError("Email already registered")

    # Hash the password before saving; convert ValueError to ClientError so the
    # HTTP layer returns 400 (not 500) for any invalid-password errors.
    try:
        hashed_password = hash_password(user.password)
    except ValueError as e:
        raise ClientError(str(e))
    
    # Create new user object
    db_user = User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_password,
        xp=0,
        medals_json='[]',   # medals earned through gameplay, not pre-assigned
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

def update_user_xp_medals(
    db: Session,
    user_id: int,
    xp_delta: int = 0,
    xp_total: Optional[int] = None,
    medals: Optional[List[str]] = None,
) -> User:
    """Update user XP (by delta or absolute value) and medals list."""
    user = get_user_by_id(db, user_id)
    if not user:
        raise ClientError("User not found")

    if xp_total is not None:
        user.xp = max(0, xp_total)
    else:
        user.xp = max(0, user.xp + xp_delta)

    if medals is not None:
        user.medals_json = json.dumps(medals)

    db.commit()
    db.refresh(user)
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


# ==================== Achievement Operations ====================

# Canonical achievement catalogue (id, title_ru, title_uz, icon, xp, category)
ACHIEVEMENTS_CATALOG = [
    ("first_lab",    "Первый опыт",              "Birinchi tajriba",        "🧪", 15, "lab"),
    ("volcano",      "Вулканолог",               "Vulqonshunos",            "🌋", 35, "lab"),
    ("color_magic",  "Алхимик",                  "Alkimyogar",              "🎨", 25, "lab"),
    ("neutralizer",  "Нейтрализатор",            "Neytralizator",           "⚗️", 20, "lab"),
    ("danger_zone",  "Отважный химик",           "Jasur kimyogar",          "💥", 40, "lab"),
    ("table_open",   "Исследователь атомов",     "Atom tadqiqotchisi",      "⚛️", 10, "general"),
    ("quest_detective", "Детектив лаборатории",  "Laboratoriya detektivi",  "🔍", 50, "quest"),
    ("quest_volcano",   "Вулкан для ярмарки",    "Yarmarqa vulqoni",        "🌋", 40, "quest"),
    ("quest_emergency", "Спасатель",             "Qutqaruvchi",             "🚨", 60, "quest"),
    ("first_lesson", "Первый урок",              "Birinchi dars",           "📚", 10, "general"),
    ("lesson_5",     "5 уроков пройдено",        "5 ta dars o'tildi",       "🎓", 30, "general"),
    ("xp_100",       "100 XP!",                  "100 XP!",                 "⭐",  0, "general"),
    ("xp_500",       "500 XP — эксперт!",        "500 XP — ekspert!",       "🌟",  0, "general"),
]


def seed_achievements(db: Session) -> None:
    """Populate achievement catalogue on first startup (idempotent)."""
    if db.query(Achievement).count() > 0:
        return
    for id_, title_ru, title_uz, icon, xp, cat in ACHIEVEMENTS_CATALOG:
        db.add(Achievement(
            id=id_, title_ru=title_ru, title_uz=title_uz,
            icon=icon, xp_reward=xp, category=cat,
        ))
    db.commit()


def grant_achievement(db: Session, user_id: int, achievement_id: str) -> UserAchievement | None:
    """
    Grant an achievement to a user.  Idempotent — returns None if already owned.
    Automatically adds xp_reward to user.xp.
    """
    already = db.query(UserAchievement).filter_by(
        user_id=user_id, achievement_id=achievement_id
    ).first()
    if already:
        return None

    achievement = db.query(Achievement).filter_by(id=achievement_id).first()
    if not achievement:
        return None

    ua = UserAchievement(user_id=user_id, achievement_id=achievement_id)
    db.add(ua)

    if achievement.xp_reward:
        user = get_user_by_id(db, user_id)
        if user:
            user.xp = max(0, user.xp + achievement.xp_reward)

    db.commit()
    db.refresh(ua)
    return ua


def get_user_achievements(db: Session, user_id: int) -> list[UserAchievement]:
    """All achievements earned by a user (with achievement data joined)."""
    return (
        db.query(UserAchievement)
        .filter_by(user_id=user_id)
        .join(Achievement)
        .all()
    )


def get_unseen_achievements(db: Session, user_id: int) -> list[UserAchievement]:
    """Achievements earned but not yet shown as a popup."""
    return (
        db.query(UserAchievement)
        .filter_by(user_id=user_id, seen=False)
        .join(Achievement)
        .all()
    )


def mark_achievements_seen(db: Session, user_id: int) -> None:
    db.query(UserAchievement).filter_by(user_id=user_id, seen=False).update({"seen": True})
    db.commit()


def check_xp_milestones(db: Session, user_id: int) -> None:
    """Auto-grant XP milestone achievements after any XP update."""
    user = get_user_by_id(db, user_id)
    if not user:
        return
    if user.xp >= 100:
        grant_achievement(db, user_id, "xp_100")
    if user.xp >= 500:
        grant_achievement(db, user_id, "xp_500")

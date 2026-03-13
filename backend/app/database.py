# Database configuration and session management
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# configuration from environment
from .config import settings

# database URL (can point to sqlite or any other supported backend)
DATABASE_URL = settings.DATABASE_URL

# Create database engine
# SQLite requires check_same_thread=False when using threads
connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
)


def verify_schema():
    """Check that all expected columns exist. Drop & recreate DB if schema is outdated."""
    import sqlite3, os, logging
    log = logging.getLogger(__name__)

    db_path = DATABASE_URL.replace("sqlite:///", "").replace("sqlite://", "")
    if not os.path.exists(db_path):
        return  # fresh DB — create_all will handle it

    if not DATABASE_URL.startswith("sqlite"):
        return  # skip for non-SQLite

    required = {"id", "username", "email", "hashed_password", "xp", "medals_json", "created_at"}
    try:
        con = sqlite3.connect(db_path)
        rows = con.execute("PRAGMA table_info(users)").fetchall()
        con.close()
        existing = {r[1] for r in rows}
        missing = required - existing
        if missing:
            log.warning("DB schema outdated — missing columns %s. Recreating database.", missing)
            os.remove(db_path)
    except Exception as e:
        log.warning("Schema check failed: %s", e)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for all models
Base = declarative_base()

# Function to get database session (for dependency injection)
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

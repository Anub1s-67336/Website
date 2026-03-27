# Database configuration and session management
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# configuration from environment
from .config import settings

import os

# database URL (can point to sqlite or any other supported backend)
DATABASE_URL = os.getenv("DATABASE_URL", settings.DATABASE_URL or "sqlite:///./app.db")
SQLALCHEMY_DATABASE_URL = DATABASE_URL

# SQLite fallback to /tmp if running on readonly filesystem (Railway containers)
if SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
    if SQLALCHEMY_DATABASE_URL.startswith("sqlite:///"):
        sqlite_path = SQLALCHEMY_DATABASE_URL[len("sqlite:///") :]
    elif SQLALCHEMY_DATABASE_URL.startswith("sqlite://"):
        sqlite_path = SQLALCHEMY_DATABASE_URL[len("sqlite://") :]
    else:
        sqlite_path = SQLALCHEMY_DATABASE_URL

    if sqlite_path.strip() == "":
        sqlite_path = "./app.db"

    sqlite_path = os.path.abspath(sqlite_path)
    target_dir = os.path.dirname(sqlite_path) or "."

    # Prefer /tmp when directory is not writable or the file is not writable
    if (not os.access(target_dir, os.W_OK)) or (
        os.path.exists(sqlite_path) and not os.access(sqlite_path, os.W_OK)
    ):
        sqlite_path = "/tmp/app.db"
        SQLALCHEMY_DATABASE_URL = f"sqlite:///{sqlite_path}"
        target_dir = os.path.dirname(sqlite_path)

    os.makedirs(target_dir, exist_ok=True)

    # Ensure file exists and is writable
    if not os.path.exists(sqlite_path):
        try:
            open(sqlite_path, "a").close()
        except OSError:
            pass

    if os.path.exists(sqlite_path) and not os.access(sqlite_path, os.W_OK):
        # Fallback to /tmp if permission issues remain
        sqlite_path = "/tmp/app.db"
        SQLALCHEMY_DATABASE_URL = f"sqlite:///{sqlite_path}"
        os.makedirs(os.path.dirname(sqlite_path), exist_ok=True)
        try:
            open(sqlite_path, "a").close()
        except OSError:
            pass

# Create database engine
# SQLite requires check_same_thread=False when using threads
connect_args = {}
if SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args=connect_args,
)


def verify_schema():
    """Check that all expected columns exist. Drop & recreate DB if schema is outdated."""
    import sqlite3, os, logging
    log = logging.getLogger(__name__)

    db_path = SQLALCHEMY_DATABASE_URL.replace("sqlite:///", "").replace("sqlite://", "")
    if not os.path.exists(db_path):
        return  # fresh DB — create_all will handle it

    if not SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
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
            try:
                if os.access(db_path, os.W_OK):
                    os.remove(db_path)
                else:
                    log.warning("DB file is not writable, skipping remove.")
            except Exception as rm_err:
                log.warning("Could not remove DB file to recreate: %s", rm_err)
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

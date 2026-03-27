# Database configuration and session management
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# configuration from environment
from .config import settings

import os

# 1) Use DATABASE_URL if provided (e.g. Railway Postgres)
DATABASE_URL = os.getenv("DATABASE_URL", "").strip()
if DATABASE_URL:
    SQLALCHEMY_DATABASE_URL = DATABASE_URL
else:
    # 2) Fallback to in-memory SQLite for Railway (no file issues)
    SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

# 4) Engine creation
connect_args = {}
if SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args=connect_args)

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

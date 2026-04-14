import os
import logging
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

logger = logging.getLogger(__name__)

# DATABASE_URL is required — set it in Render's Environment Variables
# Format from Neon.tech: postgresql://user:password@host/dbname?sslmode=require
DATABASE_URL = os.environ.get("DATABASE_URL", "").strip()

if not DATABASE_URL:
    raise RuntimeError(
        "DATABASE_URL environment variable is not set.\n"
        "Set it to your PostgreSQL connection string, for example:\n"
        "  postgresql://user:password@host/dbname?sslmode=require\n"
        "On Render: go to your service → Environment → add DATABASE_URL."
    )

# Render (and some other platforms) provide 'postgres://' — SQLAlchemy 2.x requires 'postgresql://'
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
    logger.info("Rewrote postgres:// → postgresql:// for SQLAlchemy compatibility.")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def verify_schema():
    """No-op for PostgreSQL — schema is managed by SQLAlchemy create_all."""
    pass

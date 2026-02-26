# Database configuration and session management
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# configuration from environment
from config import settings

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

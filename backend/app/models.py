# Database models using SQLAlchemy ORM
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
import json
from database import Base

# User model - stores user information
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    xp = Column(Integer, default=0)
    medals_json = Column(Text, default='["first"]')
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationship: One user can have many progress records
    progress = relationship("UserProgress", back_populates="user", cascade="all, delete-orphan")

    @property
    def medals(self) -> list:
        return json.loads(self.medals_json or '["first"]')

    @medals.setter
    def medals(self, value: list):
        self.medals_json = json.dumps(value)

# Lesson model - stores lesson information
class Lesson(Base):
    __tablename__ = "lessons"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationship: One lesson can be completed by many users
    progress = relationship("UserProgress", back_populates="lesson", cascade="all, delete-orphan")

# UserProgress model - tracks which lessons users have completed
class UserProgress(Base):
    __tablename__ = "user_progress"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    lesson_id = Column(Integer, ForeignKey("lessons.id"), index=True)
    completed = Column(Boolean, default=False)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships: Link back to User and Lesson
    user = relationship("User", back_populates="progress")
    lesson = relationship("Lesson", back_populates="progress")

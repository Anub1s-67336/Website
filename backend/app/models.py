# Database models using SQLAlchemy ORM
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
import json
from .database import Base

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
    progress      = relationship("UserProgress",    back_populates="user", cascade="all, delete-orphan")
    achievements  = relationship("UserAchievement", back_populates="user", cascade="all, delete-orphan")

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


# Achievement model — catalogue of all possible achievements
class Achievement(Base):
    __tablename__ = "achievements"

    id          = Column(String, primary_key=True)   # e.g. 'first_lab', 'volcano'
    title_ru    = Column(String, nullable=False)
    title_uz    = Column(String, nullable=False)
    description = Column(Text, default='')
    icon        = Column(String, default='🏅')
    xp_reward   = Column(Integer, default=0)
    category    = Column(String, default='general')  # general|lab|molecule|quest

    user_achievements = relationship("UserAchievement", back_populates="achievement")


# UserAchievement model — records which user earned which achievement
class UserAchievement(Base):
    __tablename__ = "user_achievements"

    id             = Column(Integer, primary_key=True, index=True)
    user_id        = Column(Integer, ForeignKey("users.id"), index=True)
    achievement_id = Column(String, ForeignKey("achievements.id"), index=True)
    earned_at      = Column(DateTime, default=datetime.utcnow)
    seen           = Column(Boolean, default=False)   # whether popup was shown

    user        = relationship("User", back_populates="achievements")
    achievement = relationship("Achievement", back_populates="user_achievements")

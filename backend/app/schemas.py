# Pydantic schemas for request/response validation
# These are used to validate incoming requests and format responses
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional

# ==================== User Schemas ====================

class UserRegister(BaseModel):
    """Schema for user registration"""
    username: str = Field(min_length=3, max_length=50)
    email: EmailStr
    # bcrypt has a 72-byte input limit; enforce a reasonable max length
    password: str = Field(min_length=8, max_length=72)

class UserLogin(BaseModel):
    """Schema for user login"""
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    """Schema for user response (no password included)"""
    id: int
    username: str
    email: str
    xp: int = 0
    medals: list[str] = ['first']
    created_at: datetime

    class Config:
        from_attributes = True  # Allows conversion from SQLAlchemy models

# ==================== Lesson Schemas ====================

class LessonCreate(BaseModel):
    """Schema for creating a lesson"""
    title: str
    description: str

class LessonResponse(BaseModel):
    """Schema for lesson response"""
    id: int
    title: str
    description: str
    created_at: datetime
    
    class Config:
        from_attributes = True

# ==================== Progress Schemas ====================

class UserProgressCreate(BaseModel):
    """Schema for marking a lesson as completed"""
    lesson_id: int

class UserProgressResponse(BaseModel):
    """Schema for progress response"""
    id: int
    user_id: int
    lesson_id: int
    completed: bool
    completed_at: Optional[datetime]
    created_at: datetime
    
    class Config:
        from_attributes = True

class LessonProgressResponse(BaseModel):
    """Schema for lesson with progress status"""
    id: int
    title: str
    description: str
    completed: bool
    
    class Config:
        from_attributes = True

# ==================== Token Schemas ====================

class TokenResponse(BaseModel):
    """Schema for token response after login"""
    access_token: str
    token_type: str
    user: UserResponse


# ==================== Progress Update Schema ====================

class UserProgressUpdateRequest(BaseModel):
    """Schema for updating user XP and medals via PATCH /users/me/progress"""
    xp_delta: Optional[int] = 0       # relative XP increment
    xp_total: Optional[int] = None    # absolute XP override (used by updateXP)
    medals: Optional[list[str]] = None

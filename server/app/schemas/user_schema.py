from typing import Optional
from pydantic import BaseModel, EmailStr, field_validator, validator, Field
from email_validator import validate_email, EmailNotValidError
import firebase_admin
from firebase_admin import auth
from datetime import datetime
from app.utils.security import hash_password  # Import from utils

class UserModel(BaseModel):
    user_id: str
    name: str = Field(..., min_length=2, max_length=20)
    email: EmailStr
    password: Optional[str] = None
    joined_date: datetime = datetime.utcnow()

    @validator("email")
    def validate_email_address(cls, email):
        try:
            validate_email(email)
            return email
        except EmailNotValidError:
            raise ValueError("Invalid email address")

    @validator("password", pre=True, always=True)
    def process_password(cls, password):
        if password is None:
            return None
        return hash_password(password)  # Use external function

    class Config:
        from_attributes = True

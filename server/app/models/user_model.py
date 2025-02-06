from datetime import datetime
from typing import Optional
from email_validator import validate_email, EmailNotValidError
from app.utils.security import hash_password  # Import from utils

class UserModel:
    def __init__(self, user_id: str, name: str, email: str, password: Optional[str] = None, joined_date: Optional[datetime] = None):
        self.user_id = user_id
        self.name = name
        self.email = self.validate_email(email)
        self.password = self.process_password(password)
        self.joined_date = joined_date or datetime.utcnow()

    @staticmethod
    def validate_email(email: str) -> str:
        """Validate email format."""
        try:
            validate_email(email)
            return email
        except EmailNotValidError:
            raise ValueError("Invalid email address")

    @staticmethod
    def process_password(password: Optional[str]) -> Optional[str]:
        """Hash the password if provided."""
        if password is None:
            return None
        return hash_password(password)

    def to_dict(self):
        """Convert UserModel to Firestore dictionary format."""
        return {
            "user_id": self.user_id,
            "name": self.name,
            "email": self.email,
            "password": self.password,  # Consider storing a hash only
            "joined_date": self.joined_date.isoformat(),
        }

    @staticmethod
    def from_dict(data):
        """Create a UserModel instance from Firestore dictionary."""
        return UserModel(
            user_id=data["user_id"],
            name=data["name"],
            email=data["email"],
            password=data.get("password"),
            joined_date=datetime.fromisoformat(data["joined_date"]) if "joined_date" in data else datetime.utcnow(),
        )

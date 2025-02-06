from datetime import datetime
from typing import Optional

class CareRoutineModel:
    def __init__(self, routine_id: str, plant_id: str, week_number: int, watering_amount: float,
                 sunlight_hours: float, additional_notes: Optional[str] = None, created_at: Optional[datetime] = None):
        self.routine_id = routine_id
        self.plant_id = plant_id
        self.week_number = week_number
        self.watering_amount = watering_amount
        self.sunlight_hours = sunlight_hours
        self.additional_notes = additional_notes
        self.created_at = created_at or datetime.utcnow()

    def to_dict(self):
        """Convert CareRoutineModel to Firestore dictionary format."""
        return {
            "routine_id": self.routine_id,
            "plant_id": self.plant_id,
            "week_number": self.week_number,
            "watering_amount": self.watering_amount,
            "sunlight_hours": self.sunlight_hours,
            "additional_notes": self.additional_notes,
            "created_at": self.created_at.isoformat(),
        }

    @staticmethod
    def from_dict(data):
        """Create a CareRoutineModel instance from Firestore dictionary."""
        return CareRoutineModel(
            routine_id=data["routine_id"],
            plant_id=data["plant_id"],
            week_number=data["week_number"],
            watering_amount=data["watering_amount"],
            sunlight_hours=data["sunlight_hours"],
            additional_notes=data.get("additional_notes"),
            created_at=datetime.fromisoformat(data["created_at"]) if "created_at" in data else datetime.utcnow(),
        )

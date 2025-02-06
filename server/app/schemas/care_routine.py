from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class CareRoutineSchema(BaseModel):
    routine_id: str = Field(..., example="routine123")
    plant_id: str = Field(..., example="plant456")  # Links to PlantModel
    week_number: int = Field(..., ge=1, le=52, example=1)  # Week 1-52
    watering_amount: float = Field(..., gt=0, example=500)  # Amount in milliliters
    sunlight_hours: float = Field(..., ge=0, le=24, example=6)  # Sunlight per day
    additional_notes: Optional[str] = Field(None, example="Water early morning for best absorption.")
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        from_attributes = True

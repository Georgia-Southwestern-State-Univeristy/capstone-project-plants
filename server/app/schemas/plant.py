from pydantic import BaseModel, Field, HttpUrl
from typing import List, Optional
from datetime import datetime

class PlantModel(BaseModel):
    plant_id: str  # ID from Perenual API
    common_name: str
    scientific_name: List[str] = []
    other_names: Optional[List[str]] = []
    cycle: Optional[str] = None  # Annual, perennial, biennial
    watering: Optional[str] = None  # Watering needs (e.g., frequent, moderate)
    sunlight: Optional[List[str]] = []  # Sunlight conditions
    image_url: Optional[HttpUrl] = None
    added_date: datetime = datetime.utcnow()

    class Config:
        orm_mode = True

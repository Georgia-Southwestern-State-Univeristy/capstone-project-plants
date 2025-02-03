from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, HttpUrl


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

    def to_dict(self):
        """Convert PlantModel to Firestore dictionary format."""
        return {
            "plant_id": self.plant_id,
            "common_name": self.common_name,
            "scientific_name": self.scientific_name,
            "other_names": self.other_names,
            "cycle": self.cycle,
            "watering": self.watering,
            "sunlight": self.sunlight,
            "image_url": str(self.image_url) if self.image_url else None,
            "added_date": self.added_date.isoformat(),
        }

    @staticmethod
    def from_dict(data):
        """Create a PlantModel instance from Firestore dictionary."""
        return PlantModel(
            plant_id=data.get("plant_id"),
            common_name=data.get("common_name"),
            scientific_name=data.get("scientific_name", []),
            other_names=data.get("other_names", []),
            cycle=data.get("cycle"),
            watering=data.get("watering"),
            sunlight=data.get("sunlight", []),
            image_url=data.get("image_url"),
            added_date=datetime.fromisoformat(data["added_date"]) if "added_date" in data else datetime.utcnow(),
)


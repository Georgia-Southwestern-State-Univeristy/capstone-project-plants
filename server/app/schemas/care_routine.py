class CareRoutineModel(BaseModel):
    date: str  # YYYY-MM-DD format
    plant_id: str  # Links to a plant
    water: bool = False
    fertilize: bool = False
    prune: bool = False
    notes: Optional[str] = None

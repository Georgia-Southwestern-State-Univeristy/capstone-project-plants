class DiseaseModel(BaseModel):
    disease_id: str
    plant_id: str  # Links to a plant
    name: str
    symptoms: str
    treatment: str

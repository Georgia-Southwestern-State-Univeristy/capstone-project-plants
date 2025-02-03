from firebase_admin import firestore
from app.models.plant_model import PlantModel

db = firestore.client()

def store_plant(plant_data):
    """Store fetched plant data in Firestore"""
    plant = PlantModel(**plant_data)
    db.collection("plants").document(plant.plant_id).set(plant.dict())

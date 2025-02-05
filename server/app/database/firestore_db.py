import os

import firebase_admin
from firebase_admin import firestore, credentials
from app.models.plant_model import PlantModel
from dotenv import load_dotenv

load_dotenv()

firebase_key_path = os.getenv("FIREBASE_KEY_PATH")

cred = credentials.Certificate(firebase_key_path)  # Ensure correct path
firebase_admin.initialize_app(cred)  # Initialize Firebase
print(firebase_admin._apps)  # This should show at least one app initialized

db = firestore.client()

def store_plant(plant_data):
    """Store fetched plant data in Firestore"""
    plant = PlantModel(**plant_data)
    db.collection("plants").document(plant.plant_id).set(plant.dict())

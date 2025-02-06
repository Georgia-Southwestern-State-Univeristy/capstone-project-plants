import os
import firebase_admin
from app.config.firebaseSetup import db
from firebase_admin import credentials, firestore
from app.models.plant_model import PlantModel
from dotenv import load_dotenv

load_dotenv()


db = firestore.client()

def store_plant(plant_data):
    """Store fetched plant data in Firestore"""
    plant = PlantModel(**plant_data)
    db.collection("plants").document(plant.plant_id).set(plant.dict())

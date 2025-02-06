from flask import Blueprint, jsonify
from app.database.firestore_db import store_plant
from app.services.perenual_service import fetch_plant_from_perenual


plants_bp = Blueprint("plants", __name__)

@plants_bp.route("/plants/<plant_id>", methods=["GET"])
def get_plant(plant_id):
    """Retrieve plant from Perenual API and store it in Firestore"""
    plant = fetch_plant_from_perenual(plant_id)
    
    if not plant:
        return jsonify({"error": "Plant not found"}), 404
    
    store_plant(plant)
    
    return jsonify(plant)

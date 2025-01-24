from flask import Blueprint, request, jsonify
from app.config.firebaseSetup import db

bp = Blueprint('plants', __name__, url_prefix='/plants')
plants_ref = db.collection('plants')

@bp.route('/', methods=['POST'])
def add_plant():
    data = request.get_json()
    # Add plant to Firestore
    doc_ref = request.app.firestore.collection('plants').add(data)
    return jsonify({"message": "Plant added successfully", "id": doc_ref.id}), 201

@bp.route('/', methods=['GET'])
def get_plants():
    plants = [doc.to_dict() for doc in request.app.firestore.collection('plants').stream()]
    return jsonify(plants), 200
from flask import Blueprint, request, jsonify
import firebase_admin
from firebase_admin import auth, credentials

bp = Blueprint('auth', __name__, url_prefix='/auth')
cred = credentials.Certificate('path/to/firebase_config.json')
firebase_admin.initialize_app(cred)

@bp.route('/signup', methods=['POST'])
def signup():
    # Mock signup. (Need to set up Firebase Auth)
    data = request.json
    email = data.get('email')
    password = data.get('password')
    try:
        user = auth.create_user(email=email, password=password)
        return jsonify({"message": "User created successfully", "uid": user.uid}), 201
    except Exception as e:
        return jsonify({"message": str(e)}), 400
    
@bp.route('/login', methods=['POST'])
def login():
    # Mock login
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    try:
        user = auth.get_user_by_email(email)
        return jsonify({"message": "User logged in successfully", "uid": user.uid}), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 400
from flask import Blueprint, request, jsonify
from app.config.firebaseSetup import db
import firebase_admin
from firebase_admin import auth, credentials
from dotenv import load_dotenv
import requests
import os

load_dotenv()

auth_bp = Blueprint('auth', __name__, url_prefix='/auth')


# # Load Firebase credentials
# cred = credentials.Certificate(os.getenv("FIREBASE_KEY_PATH"))
# if not firebase_admin._apps:
#     firebase_admin.initialize_app(cred)

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")  # Ensure this is in your .env file

def verify_google_token(token):
    """
    Verify Google OAuth Token with Google API.
    """
    google_verify_url = f"https://oauth2.googleapis.com/tokeninfo?id_token={token}"
    response = requests.get(google_verify_url)
    if response.status_code == 200:
        return response.json()
    return None

@auth_bp.route('/google-login', methods=['POST'])
def google_login():
    """
    Log in or sign up users using Google OAuth.
    """
    data = request.get_json()
    id_token = data.get("id_token")

    if not id_token:
        return jsonify({"message": "ID token is required"}), 400

    # Verify Google ID token
    google_user = verify_google_token(id_token)

    if not google_user:
        return jsonify({"message": "Invalid Google token"}), 401

    # Extract user info
    email = google_user.get("email")
    name = google_user.get("name")
    uid = google_user.get("sub")  # Google's unique user ID

    try:
        # Check if the user already exists in Firebase Auth
        firebase_user = auth.get_user_by_email(email)
    except firebase_admin.auth.UserNotFoundError:
        # If user does not exist, create one in Firebase
        firebase_user = auth.create_user(uid=uid, email=email, display_name=name)

    # Generate a Firebase Custom Token (Optional)
    custom_token = auth.create_custom_token(firebase_user.uid)

    return jsonify({
        "message": "Login successful",
        "uid": firebase_user.uid,
        "email": email,
        "token": custom_token.decode("utf-8")  # Convert bytes to string
    }), 200



@auth_bp.route('/signup', methods=['POST'])
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
    
@auth_bp.route('/login', methods=['POST'])
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
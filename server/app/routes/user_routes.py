from flask import Blueprint, request, jsonify
from firebase_admin import auth, firestore
from app.config.firebaseSetup import get_firestore_client
from app.models.user_model import UserModel

user_bp = Blueprint("user", __name__, url_prefix="/user")
db = get_firestore_client()

@user_bp.route("/<user_id>", methods=["GET"])
def get_user(user_id):
    """
    Retrieve user details from Firestore by user_id.
    """
    user_ref = db.collection("users").document(user_id).get()
    
    if not user_ref.exists:
        return jsonify({"error": "User not found"}), 404
    
    user_data = user_ref.to_dict()
    return jsonify(user_data), 200

@user_bp.route("/update/<user_id>", methods=["PUT"])
def update_user(user_id):
    """
    Update user details in Firestore.
    """
    user_ref = db.collection("users").document(user_id)
    
    if not user_ref.get().exists:
        return jsonify({"error": "User not found"}), 404

    updated_data = request.get_json()
    user_ref.update(updated_data)
    return jsonify({"message": "User updated successfully"}), 200

@user_bp.route("/delete/<user_id>", methods=["DELETE"])
def delete_user(user_id):
    """
    Delete user from Firestore and Firebase Authentication.
    """
    try:
        # Delete from Firebase Auth
        auth.delete_user(user_id)
        
        # Delete from Firestore
        db.collection("users").document(user_id).delete()
        
        return jsonify({"message": "User deleted successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

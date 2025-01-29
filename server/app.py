from flask import Flask
from flask_cors import CORS
from config.firebaseSetup import get_firestore_client  # Import Firestore client
from app.routes import plants_bp, auth_bp, ai_bp
from dotenv import load_dotenv
import os


def create_app():
    app = Flask(__name__)
    CORS(app)
    load_dotenv()
    FIREBASE_KEY_PATH = os.getenv("FIREBASE_KEY_PATH")
    db = firestore.Client.from_service_account_json(FIREBASE_KEY_PATH)


    db = get_firestore_client()  # Use existing Firestore instance
    
    app.register_blueprint(auth_bp)
    app.register_blueprint(plants_bp)
    app.register_blueprint(ai_bp)
    
    return app


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
import os
import sys

from app.config.firebaseSetup import get_firestore_client
from app.routes.auth import bp as auth_bp
from app.routes.plants import bp as plants_bp
from app.routes.ai import bp as ai_bp

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

def create_app():
    app = Flask(__name__)
    CORS(app)
    load_dotenv()
    FIREBASE_KEY_PATH = os.getenv("FIREBASE_KEY_PATH")
    db = firestore.Client.from_service_account_json(FIREBASE_KEY_PATH)

    

    db = get_firestore_client()  # Use existing Firestore instance
    app.register_blueprint(openai_bp, url_prefix='/api')
    app.register_blueprint(auth_bp)
    app.register_blueprint(plants_bp)
    app.register_blueprint(ai_bp)
    
    return app


if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', port=5000, debug=True)

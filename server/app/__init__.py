from flask import Flask
from google.cloud import firestore
from app.routes.plants_routes import plants_bp
from app.routes.auth_routes import auth_bp
from app.routes.ai_routes import ai_bp

from flask_cors import CORS

def create_app():
    app = Flask(__name__)
    CORS(app)
    # Initialize Firestore
    db = firestore.Client.from_service_account_json(FIREBASE_KEY_PATH)

    # Register Blueprints
    app.register_blueprint(plants.bp)
    app.register_blueprint(auth.bp)
    app.register_blueprint(ai.bp)
    app.register_blueprint(user.bp)

    return app

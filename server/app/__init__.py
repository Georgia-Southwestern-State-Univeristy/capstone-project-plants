from flask import Flask
from google.cloud import firestore
from app.routes import plants, auth, ai
from flask_cors import CORS

def create_app():
    app = Flask(__name__)
    CORS(app)
    # Initialize Firestore
    db = firestore.Client.from_service_account_json('path/to/firebase_config.json')

    # Register Blueprints
    app.register_blueprint(plants.bp)
    app.register_blueprint(auth.bp)
    app.register_blueprint(ai.bp)

    return app

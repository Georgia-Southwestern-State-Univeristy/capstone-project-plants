import sys
import os

sys.path.append(os.path.abspath(os.path.dirname(__file__)))

from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv

# Import blueprints
from app.routes.auth_routes import auth_bp
from app.routes.plants_routes import plants_bp
from app.routes.ai_routes import ai_bp
from app.routes.openai_routes import openai_bp
from app.routes.user_routes import user_bp


# Import Firestore setup
from app.config.firebaseSetup import get_firestore_client

def create_app():
    """Initialize and configure the Flask application."""
    app = Flask(__name__)
    CORS(app)
    load_dotenv()  # Load environment variables

    # Initialize Firestore
    db = get_firestore_client()

    # Register Blueprints
    app.register_blueprint(openai_bp)
    app.register_blueprint(user_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(plants_bp)
    app.register_blueprint(ai_bp)

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', port=8082, debug=True)

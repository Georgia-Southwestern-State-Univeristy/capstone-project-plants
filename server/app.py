import sys
import os

sys.path.append(os.path.abspath(os.path.dirname(__file__)))

# from flask import Flask
# from google.cloud import firestore
# from flask_cors import CORS
# from dotenv import load_dotenv
# from app.routes import plants, auth, ai
# from app.config.firebaseSetup import get_firestore_client

from flask import Flask
from flask_cors import CORS
from config.firebaseSetup import get_firestore_client  # Import Firestore client
from app.routes import plants_bp, auth_bp, ai_bp
from dotenv import load_dotenv
<<<<<<< Updated upstream
import os

=======

from app.routes.auth import bp as auth_bp
from app.routes.plants import bp as plants_bp
from app.routes.ai import bp as ai_bp
from app.config.firebaseSetup import get_firestore_client

>>>>>>> Stashed changes

def create_app():
    app = Flask(__name__)
    CORS(app)
<<<<<<< Updated upstream
    load_dotenv()
    FIREBASE_KEY_PATH = os.getenv("FIREBASE_KEY_PATH")
    db = firestore.Client.from_service_account_json(FIREBASE_KEY_PATH)


    db = get_firestore_client()  # Use existing Firestore instance
    
    app.register_blueprint(auth_bp)
    app.register_blueprint(plants_bp)
    app.register_blueprint(ai_bp)
    
    return app
=======
    load_dotenv()  # Load environment variables

    # Get Firestore instance
    db = get_firestore_client()
>>>>>>> Stashed changes

    # Register Blueprints
    app.register_blueprint(plants.bp)
    app.register_blueprint(auth.bp)
    app.register_blueprint(ai.bp)

<<<<<<< Updated upstream
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
=======
    return app
>>>>>>> Stashed changes

import os
from dotenv import load_dotenv
import firebase_admin
from firebase_admin import credentials, firestore

# Load environment variables
load_dotenv()

# Get the path from the environment
key_path = os.getenv("FIREBASE_KEY_PATH")

# Initialize Firebase
cred = credentials.Certificate(key_path)
firebase_admin.initialize_app(cred)

# Access Firestore
db = firestore.client()

import os
from dotenv import load_dotenv
import firebase_admin
from firebase_admin import credentials, firestore, auth
import logging

# Load environment variables
load_dotenv()

# Get the Firebase credentials path
firebase_key_path = os.getenv("FIREBASE_KEY_PATH")
if not firebase_key_path:
    logging.error("FIREBASE_KEY_PATH not found in environment variables.")
    raise EnvironmentError("FIREBASE_KEY_PATH is missing.")

# Initialize Firestore
try:
    cred = credentials.Certificate(firebase_key_path)
    firebase_admin.initialize_app(cred)
    print(firebase_admin._apps)  # This should show at least one app initialized

    db = firestore.client()
    logging.info("Firestore initialized successfully.")
except Exception as e:
    logging.error(f"Error initializing Firestore: {str(e)}")
    db = None

def get_firestore_client():
    if db is None:
        raise ValueError("Firestore is not initialized. Check logs for errors.")
    return db


def create_user(email, password):
    try:
        user = auth.create_user(email=email, password=password)
        logging.info(f"User created successfully: {user.uid}")
        return user
    except Exception as e:
        logging.error(f"Error creating user: {str(e)}")
        return None
    
def add_document(collection_name, document_id, data):
    try:
        doc_ref = db.collection(collection_name).document(document_id)
        doc_ref.set(data)
        logging.info(f"Document {document_id} added to collection {collection_name}.")
        return True
    except Exception as e:
        logging.error(f"Error adding document: {e}")
        return False

def get_documents(collection_name):
    try:
        docs = db.collection(collection_name).stream()
        return [doc.to_dict() for doc in docs]
    except Exception as e:
        logging.error(f"Error retrieving documents: {e}")
        return []
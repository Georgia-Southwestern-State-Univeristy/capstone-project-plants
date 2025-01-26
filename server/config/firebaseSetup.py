import os
from dotenv import load_dotenv
from google.cloud import firestore
import firebase_admin
from firebase_admin import credentials, firestore
import logging

# Load environment variables
load_dotenv()

# Get the path from the environment
key_path = os.getenv("FIREBASE_KEY_PATH")
if not key_path:
    logging.error("FIREBASE_KEY_PATH not found in environment variables")
    
# Initialize Firestore
try:
    cred = credentials.Certificate(key_path)
    firebase_admin.initialize_app(cred)
    db = firestore.Client()
    logging.info("Firestore initialized")
except Exception as e:
    logging.error(f"Error initializing Firestore: {str(e)}")
    db = None


def get_firestore_client():
    return db 

def create_user(email, password):
    try:
        user = auth.create_user(email=email, password=password)
        logging.info(f"User created successfully: {user.uid}")
        return user
    except Exception as e:
        logging.error(f"Error creating user: {str(e)}")
        return None
    
def add_document(collection_name, data):
    try:
        doc_ref = db.collection(collection_name).add(data)
        logging.info(f"Document added with ID: {doc_ref[1].id}")
        return doc_ref
    except Exception as e:
        logging.error(f"Error adding document: {e}")
        return None

def get_documents(collection_name):
    try:
        docs = db.collection(collection_name).stream()
        return [doc.to_dict() for doc in docs]
    except Exception as e:
        logging.error(f"Error retrieving documents: {e}")
        return []
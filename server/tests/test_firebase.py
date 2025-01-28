import pytest
from config.firebaseSetup import get_firestore_client

def firestore_client():
    return get_firestore_client()

def test_add_document():
    collection_name = "test"
    test_data  = {"name": "test plant", "watering_frequency": 3, "Sunlight": "partial"}
    
    doc_ref = firestore_client().collection(collection_name).document("testDoc")
    doc_ref.set(test_data )
    
    doc = doc_ref.get()
    assert doc.exists
    assert doc.to_dict() == test_data

# Test retrieving documents
def test_get_documents(firestore_client):
    collection_name = "testCollection"
    docs = firestore_client.collection(collection_name).stream()
    doc_list = [doc.to_dict() for doc in docs]

    # Ensure there's at least one document
    assert len(doc_list) > 0
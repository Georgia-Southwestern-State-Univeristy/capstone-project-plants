from config.firebaseSetup import add_document

if __name__ == "__main__":
    collection_name = "testCollection"
    document_id = "testDocument"
    data = {
        "name": "Sample Plant",
        "watering_interval": 7,
        "sunlight": "Partial"
    }
    
    success = add_document(collection_name, document_id, data)
    if success:
        print("Document added successfully!")
    else:
        print("Failed to add document.")

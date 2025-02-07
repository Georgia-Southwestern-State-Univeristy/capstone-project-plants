import requests
import os
from dotenv import load_dotenv

PERENUAL_API_KEY = os.getenv("PERENUAL_API_KEY")
PERENUAL_BASE_URL = "https://perenual.com/api/species/details"

def fetch_plant_from_perenual(plant_id: str):
    """Fetch plant details from Perenual API and adapt for Pydantic validation"""
    url = f"{PERENUAL_BASE_URL}/{plant_id}?key={PERENUAL_API_KEY}"
    response = requests.get(url)
    
    if response.status_code == 200:
        plant_data = response.json()
        
        # Rename 'id' to 'plant_id' to match PlantModel
        plant_data["plant_id"] = str(plant_data.pop("id", plant_id))  # Default to provided ID if missing

        return plant_data  # Return the modified dictionary
    return None

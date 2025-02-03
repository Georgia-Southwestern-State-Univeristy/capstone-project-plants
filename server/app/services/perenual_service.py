import requests
import os
from dotenv import load_dotenv

PERENUAL_API_KEY = os.getenv("PERENUAL_API_KEY")
PERENUAL_BASE_URL = "https://perenual.com/api/species/details"

def fetch_plant_from_perenual(plant_id: str):
    """Fetch plant details from Perenual API"""
    url = f"{PERENUAL_BASE_URL}/{plant_id}?key={PERENUAL_API_KEY}"
    response = requests.get(url)
    
    if response.status_code == 200:
        return response.json()
    return None

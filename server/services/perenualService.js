import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const PERENUAL_API_KEY = process.env.VITE_APP_PERENUAL_API_KEY;
const PERENUAL_BASE_URL = "https://perenual.com/api/species/details";

/**
 * Fetch plant details from Perenual API
 * @param {string} plantId - The ID of the plant to fetch
 * @returns {Promise<Object|null>} - Returns the plant data or null if not found
 */
export const fetchPlantFromPerenual = async (plantId) => {
    try {
        const url = `${PERENUAL_BASE_URL}/${plantId}?key=${PERENUAL_API_KEY}`;
        const response = await axios.get(url);

        if (response.status === 200) {
            const plantData = response.data;
            // Rename 'id' to 'plant_id' to match the expected format
            plantData.plant_id = String(plantData.id || plantId);
            delete plantData.id;

            return plantData;
        } else {
            console.error(`Perenual API Error: ${response.status} - ${response.statusText}`);
            return null;
        }
    } catch (error) {
        console.error(`Failed to fetch plant from Perenual API: ${error.message}`);
        return null;
    }
};

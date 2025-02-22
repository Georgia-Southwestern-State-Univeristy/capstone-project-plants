import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const PERENUAL_API_KEY = process.env.VITE_APP_PERENUAL_API_KEY;
const PERENUAL_BASE_URL = "https://perenual.com/api";

/**
 * Fetch plant details from Perenual API
 * @param {string} plantName - The name of the plant to fetch
 * @returns {Promise<Object|null>} - Returns the plant data or null if not found
 */
export const fetchPlantFromPerenual = async (plantName) => {
    try {
        const response = await axios.get(`${PERENUAL_BASE_URL}/species-list`, {
            params: { key: PERENUAL_API_KEY, q: plantName }
        });

        if (response.status === 200 && response.data.data.length > 0) {
            return response.data.data[0]; // Return first result
        } else {
            console.error(`Perenual API: No data found for ${plantName}`);
            return null;
        }
    } catch (error) {
        console.error(`Failed to fetch plant from Perenual API: ${error.message}`);
        return null;
    }
};

/**
 * Analyze plant health based on Google Vision results
 * @param {Array} labels - Labels returned from Google Vision API
 * @returns {Object} - Plant health analysis
 */
export const analyzePlantHealth = (labels) => {
    const diseasePatterns = ['spot', 'lesion', 'damage', 'wilt', 'yellowing'];

    const detectedIssues = labels.filter(label => 
        diseasePatterns.some(pattern => label.description.toLowerCase().includes(pattern))
    );

    return {
        isHealthy: detectedIssues.length === 0,
        details: detectedIssues.length > 0 
            ? `Detected potential issues: ${detectedIssues.map(l => l.description).join(", ")}` 
            : 'No visible health issues detected'
    };
};

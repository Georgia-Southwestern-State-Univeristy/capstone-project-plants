const API_BASE_URL = import.meta.env.VUE_APP_API_URL || 'http://localhost:5000/api';

/**
 * Helper function to make API requests
 * @param {string} endpoint - The API endpoint (e.g., '/auth/register')
 * @param {string} method - HTTP method ('GET', 'POST', etc.)
 * @param {Object} data - Request body (optional)
 * @returns {Promise<Response>}
 */
async function apiRequest(endpoint, method = 'GET', data = null) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
        },
    };

    if (data) {
        options.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
        const result = await response.json();
        return result;
    } catch (error) {
        console.error(`❌ API request failed: ${method} ${endpoint}`, error);
        throw error;
    }
}

// ✅ API Functions
export function registerUser(email, password, name) {
    return apiRequest('/auth/register', 'POST', { email, password, name });
}

export function loginUser(email) {
    return apiRequest('/auth/login', 'POST', { email });
}

export function resetPassword(email) {
    return apiRequest('/auth/reset-password', 'POST', { email });
}

export function googleLogin(idToken) {
    return apiRequest('/auth/google-login', 'POST', { id_token: idToken });
}

export default {
    registerUser,
    loginUser,
    resetPassword,
    googleLogin,
};

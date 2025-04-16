// src/services/securityApi.js
import axios from 'axios'; // Use the standard axios library

const XPOSED_API_BASE_URL = 'https://api.xposedornot.com/v1';

/**
 * Checks a specific email address for data breaches directly using XposedOrNot API.
 * Calls the /breach-analytics endpoint for more detailed info.
 * @param {string} email - The email address to check.
 * @returns {Promise<object>} - A structured response object:
 *   { success: boolean, email: string, breachesFound: boolean, breaches: array, analytics: object|null }
 * @throws {Error} If the API call fails or returns unexpected data.
 */
export const checkEmailBreachesDirect = async (email) => {
    if (!email) {
        // It's better to prevent the call if email is missing
        return Promise.reject(new Error('Email address is required for breach check.'));
        // Or throw new Error('Email address is required for breach check.');
    }

    // Use the breach-analytics endpoint for richer data as per docs
    const apiUrl = `${XPOSED_API_BASE_URL}/breach-analytics?email=${encodeURIComponent(email)}`;

    try {
        console.log(`Directly checking breaches for ${email} via XposedOrNot...`); // Frontend log
        const response = await axios.get(apiUrl, {
            headers: {
                'Accept': 'application/json'
            },
            // No API key, Authorization, or withCredentials needed for this public endpoint
            timeout: 10000 // Add a reasonable timeout (e.g., 10 seconds)
        });

        // Process the response based on XposedOrNot documentation
        if (response.data && response.data.Error === "Not found") {
             // API call succeeded, but no breaches found
             return {
                 success: true,
                 email: email,
                 breachesFound: false,
                 breaches: [],
                 analytics: null
             };
        } else if (response.data && response.data.BreachesSummary) {
            // API call succeeded, breaches found
            return {
                 success: true,
                 email: email,
                 breachesFound: true,
                 // Extract the detailed breaches array from ExposedBreaches
                 breaches: response.data.ExposedBreaches?.breaches_details || [],
                 // Include the full analytics object if needed later
                 analytics: response.data
            };
        } else {
             // The API returned a 2xx status but the body wasn't as expected
             console.warn("Unexpected response format from XposedOrNot:", response.data);
             throw new Error('Received an unexpected response from the breach check service.');
        }

    } catch (error) {
        console.error(`Error calling XposedOrNot API directly for ${email}:`, error.response?.data || error.message);

        // Improve error handling based on potential issues
        if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
            throw new Error('The breach check service timed out. Please try again.');
        }
        if (error.message.includes('Network Error')) {
             throw new Error('Network error: Could not reach the breach check service.');
        }
        if (error.response?.status === 429) {
            throw new Error('Breach check service rate limit exceeded. Please try again later.');
        }
        // Handle other potential errors (e.g., 5xx from XposedOrNot)
        throw new Error(error.response?.data?.Error || error.response?.data?.message || 'Failed to perform breach check due to an external service error.');
    }
};
// src/services/appTrackerApi.js
import axiosInstance from '../api/axios'; // Adjust path to your configured axios instance

const API_ENDPOINT = '/tracker'; // Base path for these routes based on your server.js

/**
 * Adds a new App Tracker entry.
 * @param {string} appName - The name of the app/service.
 * @param {string[]} dataShared - Array of data category strings.
 * @returns {Promise<object>} - Backend response { success, msg, data }
 */
export const addAppEntry = async (appName, dataShared) => {
    if (!appName || !Array.isArray(dataShared) || dataShared.length === 0) {
        return Promise.reject(new Error('App Name and at least one Data Category are required.'));
    }
    try {
        // POST /api/tracker
        const response = await axiosInstance.post(API_ENDPOINT, { appName, dataShared });
        return response.data;
    } catch (error) {
        console.error("API Error - addAppEntry:", error.response?.data || error.message);
        throw error.response?.data || new Error('Failed to add app entry');
    }
};

/**
 * Fetches all App Tracker entries for the logged-in user.
 * @returns {Promise<object>} - Backend response { success, count, data }
 */
export const getAppEntries = async () => {
    try {
        // GET /api/tracker
        const response = await axiosInstance.get(API_ENDPOINT);
        return response.data;
    } catch (error) {
        console.error("API Error - getAppEntries:", error.response?.data || error.message);
        if (error.response?.status === 401 || error.response?.status === 403) {
            throw new Error('Authentication failed. Please log in.');
        }
        throw error.response?.data || new Error('Failed to fetch app entries');
    }
};

/**
 * Deletes a specific App Tracker entry.
 * @param {string} entryId - The _id of the entry to delete.
 * @returns {Promise<object>} - Backend response { success, msg }
 */
export const deleteAppEntry = async (entryId) => {
    if (!entryId) return Promise.reject(new Error('Entry ID is required for deletion.'));
    try {
        // DELETE /api/tracker/:id
        const response = await axiosInstance.delete(`${API_ENDPOINT}/${entryId}`);
        return response.data;
    } catch (error) {
        console.error("API Error - deleteAppEntry:", error.response?.data || error.message);
         if (error.response?.status === 401 || error.response?.status === 403) {
            throw new Error('Authentication failed.');
        }
         if (error.response?.status === 404) {
            throw new Error('Entry not found or not authorized to delete.');
        }
        throw error.response?.data || new Error('Failed to delete app entry');
    }
};

// Add updateAppEntry later when implementing edit functionality
// export const updateAppEntry = async (entryId, updateData) => { ... }
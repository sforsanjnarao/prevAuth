// src/services/fakeDataApi.js
import axiosInstance from '../api/axios'; // Adjust path to your configured axios instance

/**
 * Calls the backend to generate fake user data and associated Mail.tm account(s).
 * @param {number} count - The number of profiles to generate (defaults to 1 if undefined).
 * @returns {Promise<object>} - The response data from the backend, likely including:
 *  { success: boolean, msg: string, generated: array, warnings?: array }
 */
export const generateFakeData = async (count = 1) => {
    try {
        // axiosInstance handles auth cookies automatically due to withCredentials: true
        const response = await axiosInstance.post('/fakedata/generate', { count });
        return response.data;
    } catch (error) {
        console.error("API Error - generateFakeData:", error.response?.data || error.message);
        throw error.response?.data || new Error('Failed to generate fake data');
    }
};

/**
 * Fetches the history of generated fake data for the logged-in user.
 * @returns {Promise<object>} - The response data from the backend, likely including:
 *  { success: boolean, count: number, data: array }
 */
export const getFakeDataHistory = async () => {
    try {
        const response = await axiosInstance.get('/fakedata/history');
        return response.data;
    } catch (error) {
        console.error("API Error - getFakeDataHistory:", error.response?.data || error.message);
        // Handle specific auth errors if needed
        if (error.response?.status === 401 || error.response?.status === 403) {
            throw new Error('Authentication failed. Please log in.');
        }
        throw error.response?.data || new Error('Failed to fetch generation history');
    }
};

/**
 * Fetches the list of email message headers for a specific generated Mail.tm inbox.
 * @param {string} fakeDataId - The _id of the FakeUserData document in your database.
 * @returns {Promise<object>} - The response data from the backend, likely including:
 *  { success: boolean, email: string, messages: array }
 */
export const getEmailInboxList = async (fakeDataId) => {
    if (!fakeDataId) return Promise.reject(new Error('Generated Data ID is required.'));
    try {
        const response = await axiosInstance.get(`/fakedata/inbox/${fakeDataId}`);
        return response.data;
    } catch (error) {
        console.error("API Error - getEmailInboxList:", error.response?.data || error.message);
        if (error.response?.status === 401 || error.response?.status === 403) {
             // Could be user auth or Mail.tm auth failure on backend
            throw new Error('Authentication failed or could not access inbox.');
        }
        if (error.response?.status === 404) {
            throw new Error('Inbox record not found or not authorized.');
        }
        throw error.response?.data || new Error('Failed to fetch inbox messages');
    }
};

/**
 * Fetches the full content of a specific email message from a generated inbox.
 * @param {string} fakeDataId - The _id of the FakeUserData document (for auth check on backend).
 * @param {string} messageId - The ID of the message assigned by Mail.tm.
 * @returns {Promise<object>} - The response data from the backend, likely including:
 *  { success: boolean, email: string, message: object }
 */
export const getEmailDetail = async (fakeDataId, messageId) => {
    if (!fakeDataId || !messageId) return Promise.reject(new Error('Generated Data ID and Message ID are required.'));
    try {
        const response = await axiosInstance.get(`/fakedata/email/${fakeDataId}/${messageId}`);
        return response.data;
    } catch (error) {
        console.error("API Error - getEmailDetail:", error.response?.data || error.message);
         if (error.response?.status === 401 || error.response?.status === 403) {
            throw new Error('Authentication failed or could not access email detail.');
        }
        if (error.response?.status === 404) {
             throw new Error('Email record or message not found/authorized.');
         }
        throw error.response?.data || new Error('Failed to fetch email details');
    }
};
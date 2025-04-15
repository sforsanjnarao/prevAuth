// src/services/vaultApi.js
import axiosInstance from '../api/axios'; // Your configured instance



// Fetches all vault entries (metadata only) for the logged-in user.
export const fetchVaultEntries = async () => {
    try {
        // Just make the request - axiosInstance handles credentials (cookies)
        const response = await axiosInstance.get('/vault');
        return response.data;
    } catch (error) {
        console.error("API Error - fetchVaultEntries:", error.response?.data || error.message);
        // Check if error is 401/403 due to missing/invalid cookie before throwing generic
        if (error.response?.status === 401 || error.response?.status === 403) {
            throw new Error('Authentication failed. Please log in.'); // More user-friendly
        }
        throw error.response?.data || new Error('Failed to fetch vault entries');
    }
};

/**
 * Adds a new vault entry.
 * @param {object} entryData - { appName, username, vaultPassword, masterPassword, url?, vaultNotes?, category? }
 */
export const addVaultEntry = async (entryData) => {
    try {
        // Just send the data - axiosInstance handles credentials (cookies)
        const response = await axiosInstance.post('/vault', entryData);
        return response.data;
    } catch (error) {
        console.error("API Error - addVaultEntry:", error.response?.data || error.message);
         if (error.response?.status === 401 || error.response?.status === 403) {
            throw new Error('Authentication failed. Please log in.');
        }
        throw error.response?.data || new Error('Failed to add vault entry');
    }
};

/**
 * Fetches decrypted data for a specific field of an entry.
 * @param {string} entryId - The ID of the vault entry.
 * @param {string} masterPassword - The user's master password.
 * @param {'password' | 'notes'} field - The field to decrypt.
 */
export const getDecryptedVaultData = async (entryId, masterPassword, field) => {
    try {
         // Just send the data - axiosInstance handles credentials (cookies)
        const response = await axiosInstance.post(`/vault/${entryId}/decrypt`, { masterPassword, field });
        return response.data;
    } catch (error) {
        console.error("API Error - getDecryptedVaultData:", error.response?.data || error.message);
         if (error.response?.status === 401 || error.response?.status === 403) {
            // Check if it's specifically a decryption failure (often 401 from controller)
            if (error.response?.data?.msg?.includes('Decrypt') || error.response?.status === 401) {
                 throw new Error(error.response?.data?.msg || 'Failed to decrypt data. Incorrect master password?');
            }
            throw new Error('Authentication failed. Please log in.');
        }
        throw new Error(error.response?.data?.msg || 'Failed to decrypt data.');
    }
};

/**
 * Updates an existing vault entry.
 * @param {string} entryId - The ID of the vault entry.
 * @param {object} updateData - Contains fields to update. Include masterPassword if updating sensitive fields.
 */
export const updateVaultEntry = async (entryId, updateData) => {
    try {
         // Just send the data - axiosInstance handles credentials (cookies)
        const response = await axiosInstance.put(`/vault/${entryId}`, updateData);
        return response.data;
    } catch (error) {
        console.error("API Error - updateVaultEntry:", error.response?.data || error.message);
        if (error.response?.status === 401 || error.response?.status === 403) {
             // Check for specific update failures vs general auth failure
             if (error.response?.data?.msg?.includes('password is required')) {
                 throw new Error(error.response.data.msg);
             }
            throw new Error('Authentication failed or invalid input. Please check details.');
        }
         throw new Error(error.response?.data?.msg || 'Failed to update vault entry.');
    }
};

/**
 * Deletes a vault entry.
 * @param {string} entryId - The ID of the vault entry.
 */
export const deleteVaultEntry = async (entryId) => {
    try {
        // Just make the request - axiosInstance handles credentials (cookies)
        const response = await axiosInstance.delete(`/vault/${entryId}`);
        return response.data;
    } catch (error) {
        console.error("API Error - deleteVaultEntry:", error.response?.data || error.message);
         if (error.response?.status === 401 || error.response?.status === 403) {
            throw new Error('Authentication failed. Please log in.');
        }
        throw error.response?.data || new Error('Failed to delete vault entry');
    }
};
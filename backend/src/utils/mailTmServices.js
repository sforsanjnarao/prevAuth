// utils/mailTmService.js
import axios from 'axios';
import { faker } from '@faker-js/faker'; // Or your preferred fake data generator

const MAIL_TM_API_BASE_URL = process.env.MAIL_TM_API_BASE_URL || 'https://api.mail.tm';

// --- Domain Fetching (Cache this in a real app) ---
let availableDomains = null;
export const getMailTmDomains = async () => {
    if (availableDomains) return availableDomains; // Return cached domains
    try {
        const response = await axios.get(`${MAIL_TM_API_BASE_URL}/domains`);
        // Extract only active domains
        availableDomains = response.data['hydra:member']?.filter(d => d.isActive).map(d => d.domain) || [];
         if (!availableDomains || availableDomains.length === 0) {
             throw new Error("No active domains found from Mail.tm");
         }
        // Simple cache invalidation (e.g., every hour) could be added here
        return availableDomains;
    } catch (error) {
        console.error("Failed to fetch Mail.tm domains:", error.response?.data || error.message);
        throw new Error("Could not retrieve available email domains.");
    }
};

// --- Account Creation ---
export const createMailTmAccount = async (address, password) => {
    try {
        const response = await axios.post(`${MAIL_TM_API_BASE_URL}/accounts`, { address, password });
        return response.data; // Contains id, address etc.
    } catch (error) {
        console.error("Mail.tm account creation failed:", error.response?.data || error.message);
        // Provide more specific error message if possible
        const errorDetail = error.response?.data?.['hydra:description'] || error.response?.data?.detail || 'Account creation failed.';
        throw new Error(`Mail.tm Error: ${errorDetail}`);
    }
};

// --- Authentication (Get Token) ---
export const loginMailTmAccount = async (address, password) => {
     try {
        const response = await axios.post(`${MAIL_TM_API_BASE_URL}/token`, { address, password });
        if (!response.data?.token) {
            throw new Error("Login successful but no token received from Mail.tm");
        }
        return response.data.token; // Return only the JWT token
    } catch (error) {
        console.error("Mail.tm login failed:", error.response?.data || error.message);
         const errorDetail = error.response?.data?.['hydra:description'] || error.response?.data?.detail || 'Login failed.';
         throw new Error(`Mail.tm Login Error: ${errorDetail}`);
    }
};

// --- Message Listing ---
export const listMessages = async (token) => {
    try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const response = await axios.get(`${MAIL_TM_API_BASE_URL}/messages`, config);
        // Return only the messages array for simplicity
        return response.data['hydra:member'] || [];
    } catch (error) {
        console.error("Mail.tm message listing failed:", error.response?.data || error.message);
        const errorDetail = error.response?.data?.['hydra:description'] || error.response?.data?.detail || 'Failed to list messages.';
        // Handle 401 Unauthorized specifically (token expired/invalid)
        if(error.response?.status === 401) {
             throw new Error(`Mail.tm Auth Error: Invalid or expired token for listing messages.`);
        }
        throw new Error(`Mail.tm Error: ${errorDetail}`);
    }
};

 // --- Get Specific Message ---
export const getMessage = async (token, messageId) => {
    try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const response = await axios.get(`${MAIL_TM_API_BASE_URL}/messages/${messageId}`, config);
        return response.data; // Returns full message object (text, html, etc.)
    } catch (error) {
         console.error(`Mail.tm get message (${messageId}) failed:`, error.response?.data || error.message);
         const errorDetail = error.response?.data?.['hydra:description'] || error.response?.data?.detail || 'Failed to retrieve message.';
         if(error.response?.status === 401) {
             throw new Error(`Mail.tm Auth Error: Invalid or expired token for getting message.`);
         }
         if(error.response?.status === 404) {
             throw new Error(`Mail.tm Error: Message with ID ${messageId} not found.`);
         }
         throw new Error(`Mail.tm Error: ${errorDetail}`);
    }
};
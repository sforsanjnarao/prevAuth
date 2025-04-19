import axios from 'axios';

const MAILTMAPI = process.env.MAIL_TM_API_BASE_URL || 'https://api.mail.tm';

// --- Domain Fetching (Cache this in a real app) ---
//Get available domains to create email
let availableDomains = null;
export const getMailTmDomains = async () => {
    if (availableDomains) return availableDomains; 
    try {
        const response = await axios.get(`${MAILTMAPI}/domains`) // we are using get request cause we want the domail or data
        // Extract only active domains
        availableDomains = response.data['hydra:member']
        ?.filter(d => d.isActive) // Filter only active domains from response.data['hydra:member']
        .map(d => d.domain) || [];//map only the is active domains
        console.log("Available Mail.tm domains:", availableDomains);
         if (!availableDomains || availableDomains.length === 0) {
             throw new Error("No active domains found from Mail.tm");
         }
        return availableDomains;  
    } catch (error) {
        console.error("Failed to fetch Mail.tm domains:", error.response?.data || error.message);
        throw new Error("Could not retrieve available email domains.");
    }
};

// --- Account Creation ---
//Create a disposable email account
export const createMailTmAccount = async (emailAddress, password) => { // email and passwor are comming from the fakeData.controller.js
    try {
        console.log(emailAddress, password)
        const response = await axios.post(`${MAILTMAPI}/accounts`, { 
            address:emailAddress, 
            password:password 
        }); // we are using post request cause we want to create a new account
        return response.data;  
    } catch (error) {
        console.error("Mail.tm account creation failed:", error.response?.data || error.message);
        // Provide more specific error message if possible
        const errorDetail = error.response?.data?.['hydra:description'] || error.response?.data?.detail || 'Account creation failed.';
        throw new Error(`Mail.tm Error: ${errorDetail}`);
    }
};

// --- Authentication (Get Token) ---
// Log in to get JWT token
export const loginMailTmAccount = async (emailAddress, password) => {
     try {
        const response = await axios.post(`${MAILTMAPI}/token`, { address:emailAddress, password:password });
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
//List inbox messages
export const listMessages = async (token) => {
    try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const response = await axios.get(`${MAILTMAPI}/messages`, config);
        console.log('list message respone:', response.data)
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
 //Fetch full email content by ID
export const getMessage = async (token, messageId) => {
    try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const response = await axios.get(`${MAILTMAPI}/messages/${messageId}`, config);
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
// utils/appTrackerConstants.js

// List of selectable data categories
export const DATA_CATEGORIES = [
    'Email Address',
    'Password', // Specifically the password used for *this* app/service
    'Full Name',
    'Phone Number',
    'Date of Birth',
    'Physical Address',
    'Precise Location', // GPS-level location
    'General Location', // City/State/Country level
    'Financial Information', // Credit Card, Bank Account etc.
    'Health & Medical Info',
    'Government ID', // SSN, Passport, Driver's License etc.
    'Photos & Videos',
    'Contact List', // Access to user's phone contacts
    'Browsing History', // Tracking activity across sites
    'Device Information', // IMEI, Device ID etc.
    'User Profile Info', // Username, Bio, Profile Pic URL (lower risk)
];

// Corresponding sensitivity scores (adjust values as you see fit)
// Higher score = more sensitive
export const DATA_SENSITIVITY_SCORES = {
    'User Profile Info': 1,
    'Email Address': 2,
    'General Location': 2,
    'Photos & Videos': 2,
    'Full Name': 3,
    'Phone Number': 3,
    'Date of Birth': 3,
    'Browsing History': 3,
    'Device Information': 3,
    'Contact List': 3,
    'Physical Address': 4,
    'Precise Location': 4,
    'Password': 4, // High risk if compromised for that specific site
    'Financial Information': 5,
    'Health & Medical Info': 5,
    'Government ID': 5,
};

// Define the maximum possible score based on the highest value above
export const MAX_POSSIBLE_SCORE = 5;

// Helper function to calculate risk score from an array of shared data types
export const calculateRiskScore = (dataSharedArray = []) => {
    let maxScore = 0;
    if (!Array.isArray(dataSharedArray)) {
        return 0; // Return 0 if input is invalid
    }
    for (const category of dataSharedArray) {
        const score = DATA_SENSITIVITY_SCORES[category] || 0; // Default to 0 if category not found
        if (score > maxScore) {
            maxScore = score;
        }
    }
    return maxScore;
};
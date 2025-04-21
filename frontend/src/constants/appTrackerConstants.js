// src/constants/appTrackerConstants.js (or wherever you keep frontend constants)

// This should ideally match the list used for validation on the backend
export const DATA_CATEGORIES = [
    'Email Address',
    'Password', // Password for the specific app
    'Full Name',
    'Phone Number',
    'Date of Birth',
    'Physical Address',
    'Precise Location',
    'General Location',
    'Financial Information',
    'Health & Medical Info',
    'Government ID',
    'Photos & Videos',
    'Contact List',
    'Browsing History',
    'Device Information',
    'User Profile Info', // Username, Bio, Profile Pic URL etc.
];

// Map scores to visual properties (colors, labels) for the frontend gauge/slider
// Adjust scores and colors/labels as needed to match backend calculation and desired UI
export const MAX_RISK_SCORE = 5; // Should match backend MAX_POSSIBLE_SCORE

export const getRiskLevel = (score) => {
    if (score <= 0) return { level: 'None', colorClass: 'bg-gray-400', labelColor: 'text-gray-700', percentage: 0 };
    if (score === 1) return { level: 'Low', colorClass: 'bg-green-500', labelColor: 'text-green-700', percentage: 20 };
    if (score === 2) return { level: 'Medium', colorClass: 'bg-yellow-500', labelColor: 'text-yellow-700', percentage: 40 };
    if (score === 3) return { level: 'High', colorClass: 'bg-orange-500', labelColor: 'text-orange-700', percentage: 60 };
    if (score === 4) return { level: 'Very High', colorClass: 'bg-red-500', labelColor: 'text-red-700', percentage: 80 };
    if (score >= 5) return { level: 'Critical', colorClass: 'bg-red-700', labelColor: 'text-red-800', percentage: 100 };
    return { level: 'Unknown', colorClass: 'bg-gray-400', labelColor: 'text-gray-700', percentage: 0 }; // Fallback
};

// Optional: Group categories for better display in the form
export const CATEGORY_GROUPS = {
    'Account & Identity': ['Email Address', 'Password', 'Full Name', 'User Profile Info', 'Date of Birth', 'Government ID'],
    'Contact Info': ['Phone Number', 'Physical Address', 'Contact List'],
    'Location': ['Precise Location', 'General Location'],
    'Financial & Health': ['Financial Information', 'Health & Medical Info'],
    'Device & Usage': ['Device Information', 'Browsing History', 'IP Address (often implicit)'], // IP Address might be inferred
    'Media': ['Photos & Videos'],
};
// Create a flattened list from groups if needed for easier iteration
export const FLATTENED_CATEGORIES = Object.values(CATEGORY_GROUPS).flat();
// Ensure this matches DATA_CATEGORIES or reconcile them. Using the grouped structure below.
// controllers/appTracker.controller.js
import AppTrackerEntryModel from '../module/appTrackingEntring.js';
import { tryCatch } from '../utils/tryCatch.js';
import AppError from '../utils/AppError.js';
import { DATA_CATEGORIES, calculateRiskScore } from '../utils/appTrackerConst.js'; // Import constants and helper

// --- Add New App Tracker Entry ---
export const addEntry = tryCatch(async (req, res) => {
    const userId = req.user._id; // From verifyJWT
    const { appName, dataShared } = req.body;
    // Add optional fields here if needed: const { appName, dataShared, appUrl, appCategory, notes } = req.body;


    // --- Validation ---
    if (!appName || !dataShared) {
        throw new AppError(400, 'Application name and shared data categories are required.', 400);
    }
    if (!Array.isArray(dataShared) || dataShared.length === 0) {
         throw new AppError(400, 'Please select at least one data category.', 400);
    }
    // Validate that all submitted categories are in our predefined list
    const invalidCategories = dataShared.filter(cat => !DATA_CATEGORIES.includes(cat));
    if (invalidCategories.length > 0) {
         throw new AppError(400, `Invalid data categories submitted: ${invalidCategories.join(', ')}`, 400);
    }

    // --- Calculate Risk Score ---
    const riskScore = calculateRiskScore(dataShared);

    // --- Create and Save ---
    const newEntry = new AppTrackerEntryModel({
        userId,
        appName,
        dataShared,
        calculatedRiskScore: riskScore,
        // Add optional fields if provided in req.body: appUrl, appCategory, notes
    });

    await newEntry.save();

    // Return the created entry (optional, adjust fields as needed)
    // Select only non-sensitive fields to return by default
    const createdEntry = await AppTrackerEntryModel.findById(newEntry._id)
                                        .select('appName dataShared calculatedRiskScore createdAt');

    res.status(201).json({
        success: true,
        msg: `Entry for "${appName}" added successfully.`,
        data: createdEntry
    });
});

// --- Get All Entries for User ---
export const getEntries = tryCatch(async (req, res) => {
    const userId = req.user._id;

    // Basic implementation without pagination/sorting for MVP
    const entries = await AppTrackerEntryModel.find({ userId: userId })
        .select('appName dataShared calculatedRiskScore createdAt updatedAt') // Select needed fields
        .sort({ appName: 1 }); // Default sort by name ascending

    res.status(200).json({
        success: true,
        count: entries.length,
        data: entries,
    });
    // TODO (Later): Implement pagination (req.query.page, req.query.limit)
    // TODO (Later): Implement sorting (req.query.sortBy, req.query.order)
});

// --- Delete an Entry ---
export const deleteEntry = tryCatch(async (req, res) => {
    const userId = req.user._id;
    const entryId = req.params.id;

    if (!entryId) {
        throw new AppError(400, 'Entry ID is required.', 400);
    }

    const entryToDelete = await AppTrackerEntryModel.findOneAndDelete({
        _id: entryId,
        userId: userId // Ensure user owns the entry
    });

    if (!entryToDelete) {
        // Either ID was wrong OR user didn't own it - 404 is safer than 403
        throw new AppError(404, 'Entry not found or you are not authorized to delete it.', 404);
    }

    res.status(200).json({
        success: true,
        msg: `Entry "${entryToDelete.appName}" deleted successfully.`
    });
});
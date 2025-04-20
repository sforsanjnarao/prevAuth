// routes/appTracker.js
import express from 'express';
import { verifyJWT } from '../middleware/userAuth.js'; // Your authentication middleware
import {
    addEntry,
    getEntries,
    deleteEntry
} from '../controllers/appTracker.controller.js'; // Import controller functions

const router = express.Router();

// Apply authentication middleware to ALL routes in this file
router.use(verifyJWT);

// --- App Tracker Routes ---

// Add a new entry
// POST /api/app-tracker
router.post('/', addEntry);

// Get all entries for the logged-in user
// GET /api/app-tracker
router.get('/', getEntries);

// Delete a specific entry
// DELETE /api/app-tracker/:id
router.delete('/:id', deleteEntry);

// Add PUT /api/app-tracker/:id later for editing

export default router;
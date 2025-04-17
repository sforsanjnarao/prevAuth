// routes/fakeData.js
import express from 'express';
import { verifyJWT } from '../middleware/userAuth.js'; // Your authentication middleware
import {
    generateData,
    getHistory,
    viewInbox,
    viewEmailDetail
} from '../controllers/fakeData.controller.js'; // Import controller functions

const router = express.Router();

// --- Apply Authentication Middleware ---
// All routes defined below will require a valid user session (JWT cookie)
router.use(verifyJWT);

// --- Fake Data Routes ---

// Generate new fake data entries (+ Mail.tm accounts)
// POST /api/fakedata/generate
// Body: { count: number (optional, default 1) }
router.post('/generate', generateData);

// Get the history of generated data for the logged-in user
// GET /api/fakedata/history
router.get('/history', getHistory);

// View the inbox (list messages) for a specific generated email account
// GET /api/fakedata/inbox/:id
// :id is the _id of the FakeUserData document
router.get('/inbox/:id', viewInbox);

// View the detailed content of a specific email within a generated inbox
// GET /api/fakedata/email/:id/:messageId
// :id is the _id of the FakeUserData document (for auth check)
// :messageId is the ID of the specific message from Mail.tm
router.get('/email/:id/:messageId', viewEmailDetail);

// --- Optional: Route for deleting generated data ---
// router.delete('/history/:id', deleteGeneratedData); // Need controller for this

export default router;
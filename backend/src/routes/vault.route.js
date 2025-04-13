// routes/vault.js
import express from 'express';
import { verifyJWT } from '../middleware/userAuth.js'; // Your authentication middleware
import {
    addVaultEntry,
    getAllVaultEntries,
    getDecryptedVaultData,
    updateVaultEntry,
    deleteVaultEntry
} from '../controller/vault.controller.js'; // Import controller functions

const router = express.Router();

// Apply authentication middleware to ALL routes in this file
router.use(verifyJWT);

// --- Vault Routes ---

// Add a new vault entry
// POST /api/vault
router.post('/', addVaultEntry);

// Get all vault entries (metadata only) for the logged-in user
// GET /api/vault
router.get('/', getAllVaultEntries);

// Decrypt specific data (password or notes) for an entry
// POST /api/vault/:id/decrypt
// Requires entry ID in URL, masterPassword and field ('password'/'notes') in body
router.post('/:id/decrypt', getDecryptedVaultData);

// Update an existing vault entry
// PUT /api/vault/:id
// Requires entry ID in URL, fields to update in body. Requires masterPassword if updating sensitive fields.
router.put('/:id', updateVaultEntry);

// Delete a vault entry
// DELETE /api/vault/:id
// Requires entry ID in URL
router.delete('/:id', deleteVaultEntry);


export default router;
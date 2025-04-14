// controllers/vault.controller.js

import VaultEntryModel from '../module/VaultEntry.js';
import userModel from '../module/user.model.js'; // Assuming path to your user model
import { deriveKey, encryptData, decryptData } from '../utils/encryption.js'; // Import encryption utils
import { tryCatch } from '../utils/tryCatch.js'; // Your tryCatch wrapper
import AppError from '../utils/AppError.js'; // Your custom error class

// --- Add New Vault Entry ---
export const addVaultEntry = tryCatch(async (req, res) => {
    const userId = req.user._id; // From verifyJWT middleware
    const {
        appName,
        username,
        vaultPassword, // Plaintext password for the service being stored
        masterPassword, // User's main login/master password for key derivation
        url,
        vaultNotes, // Plaintext notes (optional)
        category
    } = req.body;

    // --- Validation ---
    if (!appName || !username || !vaultPassword || !masterPassword) {
        throw new AppError(400, 'Missing required fields: appName, username, vaultPassword, and masterPassword are required.', 400);
    }

    // --- Fetch User's Salt ---
    // Use .select('+encryptionSalt') if you hide it by default in the model
    const user = await userModel.findById(userId).select('+encryptionSalt');
    if (!user || !user.encryptionSalt) {
        throw new AppError(404, 'User or encryption salt not found.', 404);
    }

    // --- Derive Encryption Key ---
    // IMPORTANT: masterPassword is handled temporarily here. Do NOT log it.
    const encryptionKey = await deriveKey(masterPassword, user.encryptionSalt);
    // Clear masterPassword from memory ASAP (though garbage collection handles it eventually)
    // Explicitly setting to null might help slightly but isn't foolproof security.
    req.body.masterPassword = null;

    // --- Encrypt Sensitive Data ---
    const encryptedPasswordData = encryptData(encryptionKey, vaultPassword);

    let encryptedNotesData = {};
    if (vaultNotes) {
        encryptedNotesData = encryptData(encryptionKey, vaultNotes);
    }

    // --- Create and Save Vault Entry ---
    const newEntry = new VaultEntryModel({
        userId,
        appName,
        username,
        encryptedPassword: encryptedPasswordData.encryptedData,
        passwordIv: encryptedPasswordData.iv,
        passwordAuthTag: encryptedPasswordData.authTag,
        url: url || '',
        category: category || '',
        encryptedNotes: encryptedNotesData.encryptedData || null, // Store null if no notes
        notesIv: encryptedNotesData.iv || null,
        notesAuthTag: encryptedNotesData.authTag || null,
    });

    await newEntry.save();

    res.status(201).json({ success: true, msg: 'Vault entry added successfully.' });
    // DO NOT return the created entry data containing encrypted fields/IVs by default
});


// --- Get All Vault Entries (Metadata Only) ---
export const getAllVaultEntries = tryCatch(async (req, res) => {
    const userId = req.user._id;

    // Fetch entries for the user, selecting ONLY non-sensitive fields
    const entries = await VaultEntryModel.find({ userId: userId })
        .select('_id appName username url category createdAt updatedAt') // Explicitly select safe fields
        .sort({ appName: 1 }); // Example sorting

    res.status(200).json({ success: true, count: entries.length, data: entries });
});


// --- Get Decrypted Data for a Specific Entry Field ---
export const getDecryptedVaultData = tryCatch(async (req, res) => {
    const userId = req.user._id; //khud sa nikal raha h database sa
    const entryId = req.params.id; //we are passing this in the route
    // console.log(req.body)
    const { masterPassword, field } = req.body; // field = 'password' or 'notes'

    // --- Validation ---
    if (!masterPassword || !field || (field !== 'password' && field !== 'notes')) {
        throw new AppError(400, 'masterPassword and field ("password" or "notes") are required.', 400);
    }
    if (!entryId) {
        throw new AppError(400, 'Vault entry ID is required in the URL path.', 400);
    }

    // --- Fetch User's Salt and Vault Entry Concurrently ---
    const [user, entry] = await Promise.all([
        userModel.findById(userId).select('+encryptionSalt').lean(), // Lean for performance if not saving
        // Fetch entry including the necessary encrypted fields/IVs/tags
        VaultEntryModel.findById(entryId).select('+encryptedPassword +passwordIv +passwordAuthTag +encryptedNotes +notesIv +notesAuthTag +userId')
    ]);

    // --- Checks ---
    if (!user || !user.encryptionSalt) {
        throw new AppError(404, 'User or encryption salt not found.', 404);
    }
    if (!entry) {
        throw new AppError(404, 'Vault entry not found.', 404);
    }
    console.log('Entry userId:', entry.userId.toString());
    console.log('Current userId:', userId);
    // !!! Authorization Check !!!
    if (entry.userId.toString() !== userId) {
        throw new AppError(403, 'You are not authorized to access this vault entry.', 403);
    }
    if (field === 'notes' && !entry.encryptedNotes) {
         throw new AppError(404, 'No notes exist for this entry to decrypt.', 404);
    }


    // --- Derive Key ---
    const encryptionKey = await deriveKey(masterPassword, user.encryptionSalt);
    req.body.masterPassword = null; // Clear masterPassword ASAP

    // --- Decrypt Requested Field ---
    let decryptedData;
    try {
        if (field === 'password') {
            decryptedData = decryptData(
                encryptionKey,
                entry.passwordIv,
                entry.encryptedPassword,
                entry.passwordAuthTag
            );
        } else if (field === 'notes') {
             if (!entry.encryptedNotes || !entry.notesIv || !entry.notesAuthTag) {
                 throw new AppError(400, 'Cannot decrypt notes: Missing encrypted data, IV, or auth tag.', 400);
             }
            decryptedData = decryptData(
                encryptionKey,
                entry.notesIv,
                entry.encryptedNotes,
                entry.notesAuthTag
            );
        }
    } catch (decryptError) {
        // Catch specific decryption errors (often wrong password/key)
        throw new AppError(401, decryptError.message || 'Decryption failed. Incorrect master password?', 401);
    }


    // --- Return Decrypted Data ---
    res.status(200).json({ success: true, decryptedData: decryptedData });
});


// --- Update Vault Entry ---
export const updateVaultEntry = tryCatch(async (req, res) => {
    const userId = req.user._id;
    const entryId = req.params.id;
    const {
        appName, username, url, category, // Metadata fields
        vaultPassword, // New plaintext password (optional)
        vaultNotes,    // New plaintext notes (optional, can be empty string to clear)
        masterPassword // Required ONLY if vaultPassword or vaultNotes is provided
    } = req.body;

    // --- Validation ---
     if (!entryId) {
        throw new AppError(400, 'Vault entry ID is required in the URL path.', 400);
    }
    const hasSensitiveUpdate = vaultPassword !== undefined || vaultNotes !== undefined;
    if (hasSensitiveUpdate && !masterPassword) {
        throw new AppError(400, 'Master password is required when updating password or notes.', 400);
    }

    // --- Fetch Entry and Check Ownership ---
    // Select fields needed for potential re-encryption + userId for auth check
    const entry = await VaultEntryModel.findById(entryId).select('+userId +encryptionSalt'); // Fetch user salt with entry? No, fetch user separately if needed.
     if (!entry) {
        throw new AppError(404, 'Vault entry not found.', 404);
    }
     if (entry.userId.toString() !== userId) {
        throw new AppError(403, 'You are not authorized to update this vault entry.', 403);
    }

    // --- Prepare Update Data ---
    const updateData = {};
    if (appName !== undefined) updateData.appName = appName;
    if (username !== undefined) updateData.username = username;
    if (url !== undefined) updateData.url = url;
    if (category !== undefined) updateData.category = category;

    // --- Handle Sensitive Updates ---
    if (hasSensitiveUpdate) {
        // Fetch user salt
        const user = await userModel.findById(userId).select('+encryptionSalt');
        if (!user || !user.encryptionSalt) {
            throw new AppError(500, 'Could not retrieve necessary data for update.', 500); // Internal error
        }

        // Derive key
        const encryptionKey = await deriveKey(masterPassword, user.encryptionSalt);
        req.body.masterPassword = null; // Clear masterPassword ASAP

        // Re-encrypt password if provided
        if (vaultPassword !== undefined) {
             if (vaultPassword === "") throw new AppError(400, 'Password cannot be empty.', 400); // Don't allow empty password update
            const encryptedPasswordData = encryptData(encryptionKey, vaultPassword);
            updateData.encryptedPassword = encryptedPasswordData.encryptedData;
            updateData.passwordIv = encryptedPasswordData.iv;
            updateData.passwordAuthTag = encryptedPasswordData.authTag;
        }

        // Re-encrypt or clear notes if provided
        if (vaultNotes !== undefined) {
            if (vaultNotes === "") { // Clear notes
                updateData.encryptedNotes = null;
                updateData.notesIv = null;
                updateData.notesAuthTag = null;
            } else { // Update notes
                const encryptedNotesData = encryptData(encryptionKey, vaultNotes);
                updateData.encryptedNotes = encryptedNotesData.encryptedData;
                updateData.notesIv = encryptedNotesData.iv;
                updateData.notesAuthTag = encryptedNotesData.authTag;
            }
        }
    }

    // --- Perform Update ---
    const updatedEntry = await VaultEntryModel.findByIdAndUpdate(
        entryId,
        { $set: updateData },
        { new: true, runValidators: true } // Return updated doc, run schema validators
    ).select('_id appName username url category createdAt updatedAt'); // Return only safe fields


    if (!updatedEntry) {
         throw new AppError(404, 'Vault entry not found during update.', 404); // Should not happen if initial find worked
    }

    res.status(200).json({ success: true, msg: 'Vault entry updated successfully.', data: updatedEntry });
});


// --- Delete Vault Entry ---
export const deleteVaultEntry = tryCatch(async (req, res) => {
    const userId = req.user._id;
    const entryId = req.params.id;

     if (!entryId) {
        throw new AppError(400, 'Vault entry ID is required in the URL path.', 400);
    }

    // --- Find Entry and Check Ownership ---
    // No need to select sensitive fields, just need userId
    const entry = await VaultEntryModel.findOne({ _id: entryId, userId: userId });

     if (!entry) {
         // Could be not found OR not owned by user - return 404 for security (don't reveal existence)
        throw new AppError(404, 'Vault entry not found or not authorized.', 404);
    }

    // --- Perform Deletion ---
    await VaultEntryModel.findByIdAndDelete(entryId);

    res.status(200).json({ success: true, msg: 'Vault entry deleted successfully.' });
});
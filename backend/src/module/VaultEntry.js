// models/VaultEntry.js
import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const VaultEntrySchema = new Schema({
    userId: { // Foreign key linking to the User who owns this entry
        type: Schema.Types.ObjectId,
        ref: 'User', // Links to your 'User' model
        required: true,
        index: true // Indexing for efficient lookup of a user's entries
    },
    appName: { // Name of the application, website, or service
        type: String,
        required: [true, 'Application name is required'],
        trim: true
    },
    username: { // Username or email used for that specific service
        type: String,
        required: [true, 'Username/email for the service is required'],
        trim: true
    },
    // --- ENCRYPTED PASSWORD FIELD ---
    encryptedPassword: {
        type: String, // Store Base64 encoded ciphertext
        required: [true, 'Encrypted password data is required']
    },
    // --- IV for Password Encryption ---
    passwordIv: {
        type: String, // Store Base64 encoded Initialization Vector (Nonce)
        required: [true, 'Password IV is required']
    },
    // --- Auth Tag for Password Encryption (using AES-GCM) ---
     passwordAuthTag: {
         type: String, // Store Base64 encoded Authentication Tag
         required: [true, 'Password Auth Tag is required for GCM']
     },
    // --- Optional Fields ---
    url: { // URL for the login page
        type: String,
        trim: true
    },
    // --- ENCRYPTED NOTES FIELD ---
    encryptedNotes: {
        type: String // Store Base64 encoded ciphertext (optional notes)
    },
    // --- IV for Notes Encryption ---
    notesIv: {
        type: String // Store Base64 encoded IV for notes (required if notes exist)
    },
    // --- Auth Tag for Notes Encryption ---
    notesAuthTag: {
         type: String // Store Base64 encoded Auth Tag for notes (required if notes exist)
     },
    category: { // User-defined category for organization
        type: String,
        trim: true
    },
}, { timestamps: true }); // Automatically adds createdAt and updatedAt fields

const VaultEntryModel = mongoose.models.VaultEntry || mongoose.model('VaultEntry', VaultEntrySchema);

export default VaultEntryModel;
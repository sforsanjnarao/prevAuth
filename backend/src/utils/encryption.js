// utils/encryption.js

import crypto from 'crypto';
import util from 'util'; // For promisify

// --- Configuration ---
// Use environment variables for flexibility, provide sensible defaults
const ENCRYPTION_ALGORITHM = 'aes-256-gcm'; // Recommended algorithm
const IV_LENGTH = 12; // Recommended for GCM is 12 bytes (96 bits)
const AUTH_TAG_LENGTH = 16; // Standard for GCM is 16 bytes (128 bits)
const KEY_LENGTH = 32; // For AES-256 (32 bytes * 8 = 256 bits)
const PBKDF2_ITERATIONS = parseInt(process.env.PBKDF2_ITERATIONS || '210000', 10); // High iteration count (adjust based on server performance)
const PBKDF2_DIGEST = 'sha512'; // Secure hash algorithm for PBKDF2

// Promisify crypto.pbkdf2 for async/await usage
const pbkdf2Async = util.promisify(crypto.pbkdf2);

/**
 * Derives a cryptographic key from a password and salt using PBKDF2.
 * @param {string} password - The user's master password (plaintext).
 * @param {string} saltBase64 - The user's unique salt, stored as a Base64 string.
 * @returns {Promise<Buffer>} - The derived encryption key as a Buffer.
 * @throws {Error} If key derivation fails.
 */
export const deriveKey = async (password, saltBase64) => {
    try {
        if (!password || !saltBase64) {
            throw new Error("Password and salt are required for key derivation.");
        }
        // Convert Base64 salt back to a Buffer
        const saltBuffer = Buffer.from(saltBase64, 'base64');

        // Derive the key using PBKDF2
        const derivedKey = await pbkdf2Async(
            password,
            saltBuffer,
            PBKDF2_ITERATIONS,
            KEY_LENGTH,
            PBKDF2_DIGEST
        );
        return derivedKey; // Returns a Buffer
    } catch (error) {
        console.error("Key derivation failed:", error);
        // Don't leak internal details, provide a generic error
        throw new Error("Failed to derive encryption key.");
    }
};

/**
 * Encrypts plaintext data using AES-256-GCM.
 * @param {Buffer} key - The derived encryption key (must be 32 bytes for AES-256).
 * @param {string} plaintext - The data to encrypt.
 * @returns {{iv: string, encryptedData: string, authTag: string}} - Object containing Base64 encoded IV, encrypted data, and auth tag.
 * @throws {Error} If encryption fails.
 */
export const encryptData = (key, plaintext) => {
    try {
        if (!key || key.length !== KEY_LENGTH) {
             throw new Error("Invalid key provided for encryption.");
        }
        if (plaintext === undefined || plaintext === null) {
            throw new Error("Plaintext data is required for encryption.");
        }

        // 1. Generate a unique Initialization Vector (IV) for each encryption
        const iv = crypto.randomBytes(IV_LENGTH);

        // 2. Create the AES-GCM cipher instance
        const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, key, iv, {
            authTagLength: AUTH_TAG_LENGTH
        });

        // 3. Encrypt the data (update + final)
        // Ensure plaintext is treated as utf8
        let encrypted = cipher.update(plaintext, 'utf8', 'base64');
        encrypted += cipher.final('base64');

        // 4. Get the Authentication Tag (ensures integrity and authenticity)
        const authTag = cipher.getAuthTag();

        // 5. Return Base64 encoded parts
        return {
            iv: iv.toString('base64'),
            encryptedData: encrypted, // Already Base64 from cipher output
            authTag: authTag.toString('base64')
        };
    } catch (error) {
        console.error("Encryption failed:", error);
        throw new Error("Data encryption process failed.");
    }
};

/**
 * Decrypts AES-256-GCM encrypted data.
 * @param {Buffer} key - The derived encryption key (must be 32 bytes).
 * @param {string} ivBase64 - The Base64 encoded IV used during encryption.
 * @param {string} encryptedDataBase64 - The Base64 encoded encrypted data.
 * @param {string} authTagBase64 - The Base64 encoded GCM authentication tag.
 * @returns {string} - The original plaintext data.
 * @throws {Error} If decryption fails (e.g., wrong key, tampered data, incorrect tag).
 */
export const decryptData = (key, ivBase64, encryptedDataBase64, authTagBase64) => {
    try {
         if (!key || key.length !== KEY_LENGTH) {
             throw new Error("Invalid key provided for decryption.");
         }
        if (!ivBase64 || !encryptedDataBase64 || !authTagBase64) {
             throw new Error("IV, encrypted data, and auth tag are required for decryption.");
        }

        // 1. Convert Base64 encoded parts back to Buffers
        const iv = Buffer.from(ivBase64, 'base64');
        const encryptedData = Buffer.from(encryptedDataBase64, 'base64');
        const authTag = Buffer.from(authTagBase64, 'base64');

         // Basic length checks for IV and AuthTag
        if (iv.length !== IV_LENGTH) throw new Error("Invalid IV length during decryption.");
        if (authTag.length !== AUTH_TAG_LENGTH) throw new Error("Invalid Auth Tag length during decryption.");


        // 2. Create the AES-GCM decipher instance
        const decipher = crypto.createDecipheriv(ENCRYPTION_ALGORITHM, key, iv, {
            authTagLength: AUTH_TAG_LENGTH
        });

        // 3. Set the Authentication Tag **BEFORE** decryption
        // This tells the decipher what the expected tag is for verification
        decipher.setAuthTag(authTag);

        // 4. Decrypt the data (update + final)
        // Specify output encoding as utf8
        let decrypted = decipher.update(encryptedData);
        decrypted = Buffer.concat([decrypted, decipher.final()]); // Concatenate buffers if needed

        // If decipher.final() throws, it means the auth tag didn't match (data tampered or wrong key/iv)
        return decrypted.toString('utf8');

    } catch (error) {
        // Log the specific crypto error internally, but give generic user message
        console.error("Decryption failed:", error.message); // Log specifics for debugging
        // Common reasons: Wrong key (bad master password), wrong IV, data corruption, or wrong auth tag
        throw new Error("Decryption failed. Incorrect master password or data may be corrupted.");
    }
};

// 1. User Password + Salt
//          ↓
//     [deriveKey()]
//          ↓
//       Encryption Key (Buffer)
//          ↓
//  ┌─────────────────────────────┐
//  │ Encrypt:                    │
//  │  - random IV                │
//  │  - encrypt the data         │
//  │  - get authTag              │
//  └─────────────────────────────┘
//          ↓
//    { iv, encryptedData, authTag } ← stored/sent

//          ↓
//  ┌─────────────────────────────┐
//  │ Decrypt:                    │
//  │  - same key                 │
//  │  - use iv, authTag          │
//  │  - decrypt the data         │
//  └─────────────────────────────┘
//          ↓
//      Original Plaintext
// utils/serverEncryption.js
import crypto from 'crypto';
import util from 'util';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;
// Key MUST be 32 bytes (256 bits) for aes-256-gcm
const secretKey = process.env.MAIL_TM_PASSWORD_ENCRYPTION_KEY;
if (!secretKey || Buffer.byteLength(secretKey, 'utf8') < 32) { // Basic check
    console.error("CRITICAL ERROR: MAIL_TM_PASSWORD_ENCRYPTION_KEY is missing, too short, or invalid in .env. Must be at least 32 bytes.");
    // In a real app, you might truncate or hash it to *exactly* 32 bytes,
    // but ensure it's derived securely and consistently.
    // For simplicity here, we'll throw if invalid. Requires a good key in .env.
    // A better approach uses crypto.createHash('sha256').update(secretKey).digest('base64').substring(0, 32);
    // But let's assume a proper 32+ byte key is provided for now.
    // The key should ideally be handled more securely (e.g., Buffer.from(secretKey, 'hex'))
    // For this example, we'll use the first 32 bytes directly if long enough.
    if (!secretKey || Buffer.byteLength(secretKey, 'utf8') < 32) throw new Error("Invalid server encryption key configuration.");
    // Ensure key is exactly 32 bytes
    // IMPORTANT: Using substring is NOT cryptographically sound for key derivation.
    // Use a proper KDF in production or ensure the key is exactly 32 bytes.
    // For demo purposes:
    // keyBuffer = Buffer.from(secretKey.substring(0, 32), 'utf8');
    // Let's assume the env variable IS the 32-byte key (e.g., base64 encoded)
     try {
          keyBuffer = Buffer.from(secretKey, 'base64'); // Assume key is base64 encoded in env
          if (keyBuffer.length !== 32) throw new Error();
     } catch {
          throw new Error("MAIL_TM_PASSWORD_ENCRYPTION_KEY must be a Base64 encoded 32-byte key.");
     }

} else {
     try {
          keyBuffer = Buffer.from(secretKey, 'base64'); // Assume key is base64 encoded in env
          if (keyBuffer.length !== 32) throw new Error();
     } catch {
          throw new Error("MAIL_TM_PASSWORD_ENCRYPTION_KEY must be a Base64 encoded 32-byte key.");
     }
}

export const encryptServerData = (plaintext) => {
    try {
        const iv = crypto.randomBytes(IV_LENGTH);
        const cipher = crypto.createCipheriv(ALGORITHM, keyBuffer, iv, { authTagLength: AUTH_TAG_LENGTH });
        let encrypted = cipher.update(plaintext, 'utf8', 'base64');
        encrypted += cipher.final('base64');
        const authTag = cipher.getAuthTag();
        return {
            iv: iv.toString('base64'),
            encryptedData: encrypted,
            authTag: authTag.toString('base64')
        };
    } catch (error) {
        console.error("Server-side encryption failed:", error);
        throw new Error("Server encryption process failed.");
    }
};

export const decryptServerData = (ivBase64, encryptedDataBase64, authTagBase64) => {
    try {
        const iv = Buffer.from(ivBase64, 'base64');
        const encryptedData = Buffer.from(encryptedDataBase64, 'base64');
        const authTag = Buffer.from(authTagBase64, 'base64');
        const decipher = crypto.createDecipheriv(ALGORITHM, keyBuffer, iv, { authTagLength: AUTH_TAG_LENGTH });
        decipher.setAuthTag(authTag);
        let decrypted = decipher.update(encryptedData);
         // If using Base64 for encryptedData input to update:
         // let decrypted = decipher.update(encryptedData, 'base64', 'utf8');
         // decrypted += decipher.final('utf8');
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString('utf8');
    } catch (error) {
        console.error("Server-side decryption failed:", error);
        throw new Error("Server decryption failed. Key or data may be invalid.");
    }
};
// utils/serverEncryption.js
import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // GCM standard
const AUTH_TAG_LENGTH = 16; // GCM default
const KEY_LENGTH = 32; // 32 bytes = 256 bits

const secretKey = process.env.MAIL_TM_PASSWORD_ENCRYPTION_KEY;

let keyBuffer;

if (!secretKey) {
  throw new Error("CRITICAL ERROR: MAIL_TM_PASSWORD_ENCRYPTION_KEY is missing in .env.");
}

try {
  keyBuffer = Buffer.from(secretKey, 'base64');
  if (keyBuffer.length !== KEY_LENGTH) {
    throw new Error("MAIL_TM_PASSWORD_ENCRYPTION_KEY must be a Base64 encoded 32-byte key.");
  }
} catch {
  throw new Error("MAIL_TM_PASSWORD_ENCRYPTION_KEY must be a valid Base64 encoded 32-byte key.");
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
    console.log(`encryptedData: ${encryptedData.toString('base64')}`);

    let decrypted = decipher.update(encryptedData);
    console.log(`decrypted: ${decrypted.toString('utf8')}`);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString('utf8');
  } catch (error) {
    console.error("Server-side decryption failed:", error);
    throw new Error("Server decryption failed. Key or data may be invalid.");
  }
};
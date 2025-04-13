// Import your utils
import { deriveKey, encryptData, decryptData } from './utils/encryption.js';

// Example usage
const password = 'mySecret123';
const salt = 'base64-salt-string'; // should be unique per user and stored

const key = await deriveKey(password, salt);

const plaintext = 'This is secret!';
const encrypted = encryptData(key, plaintext);

// Later...
const decrypted = decryptData(key, encrypted.iv, encrypted.encryptedData, encrypted.authTag);
console.log(decrypted); // => 'This is secret!'
import crypto from 'crypto';
import { env } from '../config/env.js';

// AES-256-GCM requires a 32-byte key
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const TAG_LENGTH = 16;

// Derive 32-byte key from env.ENCRYPTION_KEY using SHA-256
const getKey = (): Buffer => {
  return crypto.createHash('sha256').update(env.ENCRYPTION_KEY).digest();
};

export interface EncryptedData {
  encrypted: string;
}

/**
 * Encrypts a plaintext string using AES-256-GCM
 * Returns a colon-delimited string: iv:authTag:ciphertext
 */
export const encrypt = (text: string): string => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const tag = cipher.getAuthTag();

  return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted}`;
};

/**
 * Decrypts an AES-256-GCM encrypted string formatted as iv:authTag:ciphertext
 */
export const decrypt = (cipherText: string): string => {
  const parts = cipherText.split(':');
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted ciphertext format');
  }

  const [ivHex, tagHex, encryptedData] = parts;
  const iv = Buffer.from(ivHex, 'hex');
  const tag = Buffer.from(tagHex, 'hex');

  const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), iv);
  decipher.setAuthTag(tag);

  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
};

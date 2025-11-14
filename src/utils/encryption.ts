/**
 * Encryption Utilities
 * 
 * Provides AES-256-GCM encryption/decryption for localStorage data
 * Uses Web Crypto API for secure, browser-native encryption
 */

// Storage key for the encryption key
const ENCRYPTION_KEY_STORAGE = 'app-encryption-key';

/**
 * Generate a cryptographic key for AES-GCM encryption
 */
async function generateEncryptionKey(): Promise<CryptoKey> {
  return await crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256, // AES-256
    },
    true, // extractable
    ['encrypt', 'decrypt']
  );
}

/**
 * Export a CryptoKey to a string that can be stored
 */
async function exportKey(key: CryptoKey): Promise<string> {
  const exported = await crypto.subtle.exportKey('jwk', key);
  return JSON.stringify(exported);
}

/**
 * Import a CryptoKey from a stored string
 */
async function importKey(keyData: string): Promise<CryptoKey> {
  const jwk = JSON.parse(keyData);
  return await crypto.subtle.importKey(
    'jwk',
    jwk,
    {
      name: 'AES-GCM',
      length: 256,
    },
    true,
    ['encrypt', 'decrypt']
  );
}

/**
 * Get or create the encryption key
 * Key is stored in localStorage for persistence across sessions
 */
async function getOrCreateEncryptionKey(): Promise<CryptoKey> {
  try {
    // Try to load existing key
    const storedKey = localStorage.getItem(ENCRYPTION_KEY_STORAGE);
    
    if (storedKey) {
      try {
        return await importKey(storedKey);
      } catch {
        // If import fails, generate new key
        // eslint-disable-next-line no-console
        console.warn('Failed to import stored key, generating new one');
      }
    }
    
    // Generate new key
    const newKey = await generateEncryptionKey();
    const exportedKey = await exportKey(newKey);
    localStorage.setItem(ENCRYPTION_KEY_STORAGE, exportedKey);
    
    return newKey;
  } catch (error) {
    throw new Error(`Failed to get encryption key: ${(error as Error).message}`);
  }
}

/**
 * Encrypt data using AES-256-GCM
 * 
 * @param plaintext - The data to encrypt
 * @returns Base64-encoded encrypted data with IV prepended
 */
export async function encryptData(plaintext: string): Promise<string> {
  try {
    // Check if crypto is available
    if (!crypto || !crypto.subtle) {
      throw new Error('Web Crypto API not available');
    }

    // Get the encryption key
    const key = await getOrCreateEncryptionKey();

    // Generate a random initialization vector (IV)
    const iv = crypto.getRandomValues(new Uint8Array(12)); // 96 bits for GCM

    // Encode the plaintext
    const encoder = new TextEncoder();
    const data = encoder.encode(plaintext);

    // Encrypt the data
    const encrypted = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      key,
      data
    );

    // Combine IV and encrypted data
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(encrypted), iv.length);

    // Convert to base64 for storage
    return btoa(String.fromCharCode(...combined));
  } catch (error) {
    throw new Error(`Encryption failed: ${(error as Error).message}`);
  }
}

/**
 * Decrypt data using AES-256-GCM
 * 
 * @param encryptedData - Base64-encoded encrypted data with IV prepended
 * @returns Decrypted plaintext
 */
export async function decryptData(encryptedData: string): Promise<string> {
  try {
    // Check if crypto is available
    if (!crypto || !crypto.subtle) {
      throw new Error('Web Crypto API not available');
    }

    // Get the encryption key
    const key = await getOrCreateEncryptionKey();

    // Decode from base64
    const combined = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));

    // Extract IV and encrypted data
    const iv = combined.slice(0, 12);
    const data = combined.slice(12);

    // Decrypt the data
    const decrypted = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      key,
      data
    );

    // Decode the decrypted data
    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  } catch (error) {
    throw new Error(`Decryption failed: ${(error as Error).message}`);
  }
}

/**
 * Check if encryption is available in the current environment
 */
export function isEncryptionAvailable(): boolean {
  return typeof crypto !== 'undefined' && 
         typeof crypto.subtle !== 'undefined' &&
         typeof crypto.getRandomValues !== 'undefined';
}

/**
 * Securely store encrypted data in localStorage
 * 
 * @param key - Storage key
 * @param value - Value to encrypt and store
 */
export async function secureSetItem(key: string, value: string): Promise<void> {
  if (!isEncryptionAvailable()) {
    throw new Error('Encryption not available');
  }

  const encrypted = await encryptData(value);
  localStorage.setItem(key, encrypted);
}

/**
 * Retrieve and decrypt data from localStorage
 * 
 * @param key - Storage key
 * @returns Decrypted value or null if not found
 */
export async function secureGetItem(key: string): Promise<string | null> {
  if (!isEncryptionAvailable()) {
    throw new Error('Encryption not available');
  }

  const encrypted = localStorage.getItem(key);
  if (!encrypted) {
    return null;
  }

  try {
    return await decryptData(encrypted);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`Failed to decrypt data for key "${key}":`, error);
    // If decryption fails, remove the corrupted data
    localStorage.removeItem(key);
    return null;
  }
}

/**
 * Remove encrypted data from localStorage
 * 
 * @param key - Storage key
 */
export function secureRemoveItem(key: string): void {
  localStorage.removeItem(key);
}

/**
 * Clear the encryption key (forces regeneration on next use)
 * Use with caution: this will make all encrypted data unreadable
 */
export function clearEncryptionKey(): void {
  localStorage.removeItem(ENCRYPTION_KEY_STORAGE);
  // eslint-disable-next-line no-console
  console.warn('Encryption key cleared. All encrypted data will be regenerated.');
}

/**
 * Test encryption/decryption functionality
 * Useful for debugging
 */
export async function testEncryption(): Promise<boolean> {
  try {
    const testData = 'Test encryption data 🔒';
    const encrypted = await encryptData(testData);
    const decrypted = await decryptData(encrypted);
    return decrypted === testData;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Encryption test failed:', error);
    return false;
  }
}


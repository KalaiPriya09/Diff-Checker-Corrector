/**
 * Validator storage service
 * Handles saving and loading of validator session data with encryption
 */

import { isLocalStorageAvailable } from '@/utils/errorHandling';
import { secureSetItem, secureGetItem, secureRemoveItem, isEncryptionAvailable } from '@/utils/encryption';

// Storage keys for Validator
const STORAGE_KEYS = {
  SESSION_ENABLED: 'validator-preserve-session',
  CONTENT: 'validator-content',
  VALIDATION_TYPE: 'validator-validation-type',
  LAST_SAVED: 'validator-last-saved',
} as const;

// Type for saved validator session data
export interface SavedValidatorData {
  content: string;
  validationType: 'JSON' | 'XML';
  savedAt: string; // ISO timestamp
}

/**
 * Check if validator session preservation is enabled
 */
export function isValidatorSessionEnabled(): boolean {
  if (!isLocalStorageAvailable()) {
    return false;
  }

  try {
    return localStorage.getItem(STORAGE_KEYS.SESSION_ENABLED) === 'true';
  } catch {
    return false;
  }
}

/**
 * Enable or disable validator session preservation
 */
export function setValidatorSessionEnabled(enabled: boolean): void {
  if (!isLocalStorageAvailable()) {
    console.warn('localStorage is not available');
    return;
  }

  try {
    localStorage.setItem(STORAGE_KEYS.SESSION_ENABLED, String(enabled));
  } catch (error) {
    console.error('Failed to set validator session preserve setting:', error);
  }
}

/**
 * Save validator session data to localStorage with encryption
 */
export async function saveValidatorData(data: Omit<SavedValidatorData, 'savedAt'>): Promise<void> {
  if (!isLocalStorageAvailable() || !isEncryptionAvailable()) {
    return;
  }

  try {
    // Only save if preservation is enabled
    if (!isValidatorSessionEnabled()) {
      return;
    }

    const now = new Date().toISOString();

    // Save each piece of data separately with encryption
    await secureSetItem(STORAGE_KEYS.CONTENT, data.content);
    await secureSetItem(STORAGE_KEYS.VALIDATION_TYPE, data.validationType);
    await secureSetItem(STORAGE_KEYS.LAST_SAVED, now);

    // eslint-disable-next-line no-console
    console.log('✅ Validator data saved (encrypted) at:', now);
  } catch (error) {
    console.error('Failed to save validator data:', error);
    
    // Check for quota exceeded error
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      console.error('Storage quota exceeded!');
    }
  }
}

/**
 * Load validator session data from localStorage with decryption
 */
export async function loadValidatorData(): Promise<SavedValidatorData | null> {
  if (!isLocalStorageAvailable() || !isEncryptionAvailable()) {
    return null;
  }

  try {
    // Check if preservation is enabled
    if (!isValidatorSessionEnabled()) {
      return null;
    }

    // Decrypt each piece of data
    const content = await secureGetItem(STORAGE_KEYS.CONTENT);
    const validationType = await secureGetItem(STORAGE_KEYS.VALIDATION_TYPE);
    const savedAt = await secureGetItem(STORAGE_KEYS.LAST_SAVED);

    // If no data exists, return null
    if (!content && !validationType) {
      return null;
    }

    // Validate validation type
    const validTypes: Array<'JSON' | 'XML'> = ['JSON', 'XML'];
    const validatedType = validTypes.includes(validationType as 'JSON' | 'XML')
      ? (validationType as 'JSON' | 'XML')
      : 'JSON';

    return {
      content: content || '',
      validationType: validatedType,
      savedAt: savedAt || new Date().toISOString(),
    };
  } catch (error) {
    console.error('Failed to load validator data:', error);
    return null;
  }
}

/**
 * Get the last saved timestamp (decrypted)
 */
export async function getValidatorLastSavedTime(): Promise<string | null> {
  if (!isLocalStorageAvailable() || !isEncryptionAvailable()) {
    return null;
  }

  try {
    return await secureGetItem(STORAGE_KEYS.LAST_SAVED);
  } catch {
    return null;
  }
}

/**
 * Clear all validator session data (encrypted)
 */
export function clearValidatorData(): void {
  if (!isLocalStorageAvailable()) {
    return;
  }

  try {
    secureRemoveItem(STORAGE_KEYS.CONTENT);
    secureRemoveItem(STORAGE_KEYS.VALIDATION_TYPE);
    secureRemoveItem(STORAGE_KEYS.LAST_SAVED);
    // eslint-disable-next-line no-console
    console.log('✅ Validator data cleared');
  } catch (error) {
    console.error('Failed to clear validator data:', error);
  }
}

/**
 * Get storage usage information for Validator data
 */
export function getValidatorStorageSize(): number {
  if (!isLocalStorageAvailable()) {
    return 0;
  }

  try {
    let totalSize = 0;
    
    // Calculate size of all Validator-related keys
    Object.values(STORAGE_KEYS).forEach((key) => {
      const value = localStorage.getItem(key);
      if (value) {
        totalSize += key.length + value.length;
      }
    });
    
    return totalSize * 2; // UTF-16 uses 2 bytes per character
  } catch {
    return 0;
  }
}


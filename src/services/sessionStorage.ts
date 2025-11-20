/**
 * Session storage service for DiffChecker
 * Handles saving and loading of session data with validation and encryption
 */

import type { FormatType } from '../types/common';
import type { DiffOptions } from '@/utils/diffChecker';
import { safeJsonParse, isLocalStorageAvailable } from '@/utils/errorHandling';
import { secureSetItem, secureGetItem, secureRemoveItem, isEncryptionAvailable } from '@/utils/encryption';

// Storage keys
const STORAGE_KEYS = {
  SESSION_ENABLED: 'diffchecker-preserve-session',
  LEFT_INPUT: 'diffchecker-left-input',
  RIGHT_INPUT: 'diffchecker-right-input',
  LEFT_FORMAT: 'diffchecker-left-format',
  RIGHT_FORMAT: 'diffchecker-right-format',
  DIFF_OPTIONS: 'diffchecker-diff-options',
  LAST_SAVED: 'diffchecker-last-saved',
} as const;

// Type for saved session data
export interface SavedSessionData {
  leftInput: string;
  rightInput: string;
  leftFormat: FormatType;
  rightFormat: FormatType;
  diffOptions: DiffOptions;
  savedAt: string; // ISO timestamp
}

/**
 * Check if session preservation is enabled
 */
export function isSessionPreserveEnabled(): boolean {
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
 * Enable or disable session preservation
 */
export function setSessionPreserveEnabled(enabled: boolean): void {
  if (!isLocalStorageAvailable()) {
    console.warn('localStorage is not available');
    return;
  }

  try {
    localStorage.setItem(STORAGE_KEYS.SESSION_ENABLED, String(enabled));
  } catch (error) {
    console.error('Failed to set session preserve setting:', error);
  }
}

/**
 * Save complete session data to localStorage with encryption
 */
export async function saveSessionData(data: Omit<SavedSessionData, 'savedAt'>): Promise<void> {
  if (!isLocalStorageAvailable() || !isEncryptionAvailable()) {
    return;
  }

  try {
    // Only save if preservation is enabled
    if (!isSessionPreserveEnabled()) {
      return;
    }

    const now = new Date().toISOString();

    // Save each piece of data separately with encryption
    await secureSetItem(STORAGE_KEYS.LEFT_INPUT, data.leftInput);
    await secureSetItem(STORAGE_KEYS.RIGHT_INPUT, data.rightInput);
    await secureSetItem(STORAGE_KEYS.LEFT_FORMAT, data.leftFormat);
    await secureSetItem(STORAGE_KEYS.RIGHT_FORMAT, data.rightFormat);
    await secureSetItem(STORAGE_KEYS.DIFF_OPTIONS, JSON.stringify(data.diffOptions));
    await secureSetItem(STORAGE_KEYS.LAST_SAVED, now);

    // eslint-disable-next-line no-console
    console.log('✅ Session data saved (encrypted) at:', now);
  } catch (error) {
    console.error('Failed to save session data:', error);
    
    // Check for quota exceeded error
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      console.error('Storage quota exceeded!');
    }
  }
}

/**
 * Load session data from localStorage with decryption
 */
export async function loadSessionData(): Promise<SavedSessionData | null> {
  if (!isLocalStorageAvailable() || !isEncryptionAvailable()) {
    return null;
  }

  try {
    // Check if preservation is enabled
    if (!isSessionPreserveEnabled()) {
      return null;
    }

    // Decrypt each piece of data
    const leftInput = await secureGetItem(STORAGE_KEYS.LEFT_INPUT);
    const rightInput = await secureGetItem(STORAGE_KEYS.RIGHT_INPUT);
    const leftFormat = await secureGetItem(STORAGE_KEYS.LEFT_FORMAT);
    const rightFormat = await secureGetItem(STORAGE_KEYS.RIGHT_FORMAT);
    const diffOptionsStr = await secureGetItem(STORAGE_KEYS.DIFF_OPTIONS);
    const savedAt = await secureGetItem(STORAGE_KEYS.LAST_SAVED);

    // If no data exists, return null
    if (!leftInput && !rightInput && !diffOptionsStr) {
      return null;
    }

    // Parse diff options with fallback
    const defaultDiffOptions: DiffOptions = {
      ignoreWhitespace: false,
      caseSensitive: true,
      ignoreKeyOrder: false,
    };

    const diffOptions = diffOptionsStr
      ? safeJsonParse<DiffOptions>(diffOptionsStr, defaultDiffOptions)
      : defaultDiffOptions;

    // Validate formats
    const validFormats: FormatType[] = ['text', 'json', 'xml'];
    const validatedLeftFormat = validFormats.includes(leftFormat as FormatType) 
      ? (leftFormat as FormatType) 
      : 'text';
    const validatedRightFormat = validFormats.includes(rightFormat as FormatType)
      ? (rightFormat as FormatType)
      : 'text';

    return {
      leftInput: leftInput || '',
      rightInput: rightInput || '',
      leftFormat: validatedLeftFormat,
      rightFormat: validatedRightFormat,
      diffOptions,
      savedAt: savedAt || new Date().toISOString(),
    };
  } catch (error) {
    console.error('Failed to load session data:', error);
    return null;
  }
}

/**
 * Get the last saved timestamp (decrypted)
 */
export async function getLastSavedTime(): Promise<string | null> {
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
 * Clear all session data (encrypted)
 */
export function clearSessionData(): void {
  if (!isLocalStorageAvailable()) {
    return;
  }

  try {
    secureRemoveItem(STORAGE_KEYS.LEFT_INPUT);
    secureRemoveItem(STORAGE_KEYS.RIGHT_INPUT);
    secureRemoveItem(STORAGE_KEYS.LEFT_FORMAT);
    secureRemoveItem(STORAGE_KEYS.RIGHT_FORMAT);
    secureRemoveItem(STORAGE_KEYS.DIFF_OPTIONS);
    secureRemoveItem(STORAGE_KEYS.LAST_SAVED);
    // eslint-disable-next-line no-console
    console.log('✅ Session data cleared');
  } catch (error) {
    console.error('Failed to clear session data:', error);
  }
}

/**
 * Get storage usage information for DiffChecker data
 */
export function getSessionStorageSize(): number {
  if (!isLocalStorageAvailable()) {
    return 0;
  }

  try {
    let totalSize = 0;
    
    // Calculate size of all DiffChecker-related keys
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


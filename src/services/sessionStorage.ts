/**
 * Session storage service for DiffChecker
 * Handles saving and loading of session data with validation and encryption
 * Now supports per-tab isolation to prevent data bleeding between tabs
 */

import type { FormatType, componentType, DiffOptions } from '../types/common';
import { safeJsonParse, isLocalStorageAvailable } from '@/utils/errorHandling';
import { secureSetItem, secureGetItem, secureRemoveItem, isEncryptionAvailable } from '@/utils/encryption';

// Generate tab-specific storage keys
function getStorageKeys(tabId: componentType) {
  const prefix = `diffchecker-${tabId}-`;
  return {
    SESSION_ENABLED: 'diffchecker-preserve-session', // Global setting
    LEFT_INPUT: `${prefix}left-input`,
    RIGHT_INPUT: `${prefix}right-input`,
    INPUT: `${prefix}input`, // For validate mode (single input)
    LEFT_FORMAT: `${prefix}left-format`,
    RIGHT_FORMAT: `${prefix}right-format`,
    DIFF_OPTIONS: `${prefix}diff-options`,
    LAST_SAVED: `${prefix}last-saved`,
  } as const;
}

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
    return localStorage.getItem('diffchecker-preserve-session') === 'true';
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
    localStorage.setItem('diffchecker-preserve-session', String(enabled));
  } catch (error) {
    console.error('Failed to set session preserve setting:', error);
  }
}

/**
 * Save complete session data to localStorage with encryption (tab-specific)
 */
export async function saveSessionData(
  tabId: componentType,
  data: Omit<SavedSessionData, 'savedAt'>
): Promise<void> {
  if (!isLocalStorageAvailable() || !isEncryptionAvailable()) {
    return;
  }

  try {
    // Only save if preservation is enabled
    if (!isSessionPreserveEnabled()) {
      return;
    }

    const now = new Date().toISOString();
    const keys = getStorageKeys(tabId);

    // Determine if this is a validate mode (single input) or compare mode (two inputs)
    const isValidateMode = tabId.includes('-validate');

    if (isValidateMode) {
      // For validate mode, save only leftInput as "input"
      await secureSetItem(keys.INPUT, data.leftInput);
    } else {
      // For compare mode, save both inputs
      await secureSetItem(keys.LEFT_INPUT, data.leftInput);
      await secureSetItem(keys.RIGHT_INPUT, data.rightInput);
    }

    await secureSetItem(keys.LEFT_FORMAT, data.leftFormat);
    await secureSetItem(keys.RIGHT_FORMAT, data.rightFormat);
    await secureSetItem(keys.DIFF_OPTIONS, JSON.stringify(data.diffOptions));
    await secureSetItem(keys.LAST_SAVED, now);

    // eslint-disable-next-line no-console
    console.log(`✅ Session data saved (encrypted) for ${tabId} at:`, now);
  } catch (error) {
    console.error(`Failed to save session data for ${tabId}:`, error);
    
    // Check for quota exceeded error
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      console.error('Storage quota exceeded!');
    }
  }
}

/**
 * Load session data from localStorage with decryption (tab-specific)
 */
export async function loadSessionData(tabId: componentType): Promise<SavedSessionData | null> {
  if (!isLocalStorageAvailable() || !isEncryptionAvailable()) {
    return null;
  }

  try {
    // Check if preservation is enabled
    if (!isSessionPreserveEnabled()) {
      return null;
    }

    const keys = getStorageKeys(tabId);
    const isValidateMode = tabId.includes('-validate');

    // Load data based on mode
    let leftInput = '';
    let rightInput = '';

    if (isValidateMode) {
      // For validate mode, load from single input key
      leftInput = (await secureGetItem(keys.INPUT)) || '';
      rightInput = ''; // Validate mode doesn't use right input
    } else {
      // For compare mode, load both inputs
      leftInput = (await secureGetItem(keys.LEFT_INPUT)) || '';
      rightInput = (await secureGetItem(keys.RIGHT_INPUT)) || '';
    }

    const leftFormat = await secureGetItem(keys.LEFT_FORMAT);
    const rightFormat = await secureGetItem(keys.RIGHT_FORMAT);
    const diffOptionsStr = await secureGetItem(keys.DIFF_OPTIONS);
    const savedAt = await secureGetItem(keys.LAST_SAVED);

    // If no data exists for this tab, return null
    if (!leftInput && !rightInput && !diffOptionsStr) {
      return null;
    }

    // Parse diff options with fallback
    const defaultDiffOptions: DiffOptions = {
      ignoreWhitespace: false,
      caseSensitive: true,
      ignoreKeyOrder: false,
      ignoreAttributeOrder: false,
      ignoreArrayOrder: false,
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
    console.error(`Failed to load session data for ${tabId}:`, error);
    return null;
  }
}

/**
 * Get the last saved timestamp (decrypted) for a specific tab
 */
export async function getLastSavedTime(tabId: componentType): Promise<string | null> {
  if (!isLocalStorageAvailable() || !isEncryptionAvailable()) {
    return null;
  }

  try {
    const keys = getStorageKeys(tabId);
    return await secureGetItem(keys.LAST_SAVED);
  } catch {
    return null;
  }
}

/**
 * Clear session data for a specific tab (encrypted)
 */
export function clearSessionData(tabId: componentType): void {
  if (!isLocalStorageAvailable()) {
    return;
  }

  try {
    const keys = getStorageKeys(tabId);
    secureRemoveItem(keys.LEFT_INPUT);
    secureRemoveItem(keys.RIGHT_INPUT);
    secureRemoveItem(keys.INPUT);
    secureRemoveItem(keys.LEFT_FORMAT);
    secureRemoveItem(keys.RIGHT_FORMAT);
    secureRemoveItem(keys.DIFF_OPTIONS);
    secureRemoveItem(keys.LAST_SAVED);
    // eslint-disable-next-line no-console
    console.log(`✅ Session data cleared for ${tabId}`);
  } catch (error) {
    console.error(`Failed to clear session data for ${tabId}:`, error);
  }
}

/**
 * Clear all session data for all tabs
 */
export function clearAllSessionData(): void {
  if (!isLocalStorageAvailable()) {
    return;
  }

  try {
    const allTabs: componentType[] = [
      'json-compare',
      'json-validate',
      'xml-compare',
      'xml-validate',
      'text-compare',
    ];

    allTabs.forEach(tabId => {
      clearSessionData(tabId);
    });

    // eslint-disable-next-line no-console
    console.log('✅ All session data cleared');
  } catch (error) {
    console.error('Failed to clear all session data:', error);
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
    const allTabs: componentType[] = [
      'json-compare',
      'json-validate',
      'xml-compare',
      'xml-validate',
      'text-compare',
    ];
    
    // Calculate size of all DiffChecker-related keys for all tabs
    allTabs.forEach(tabId => {
      const keys = getStorageKeys(tabId);
      Object.values(keys).forEach((key) => {
        if (key !== keys.SESSION_ENABLED) { // Skip global setting
          const value = localStorage.getItem(key);
          if (value) {
            totalSize += key.length + value.length;
          }
        }
      });
    });
    
    // Add global setting
    const globalValue = localStorage.getItem('diffchecker-preserve-session');
    if (globalValue) {
      totalSize += 'diffchecker-preserve-session'.length + globalValue.length;
    }
    
    return totalSize * 2; // UTF-16 uses 2 bytes per character
  } catch {
    return 0;
  }
}


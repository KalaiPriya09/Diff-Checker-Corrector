/**
 * Session storage service for DiffChecker
 * Handles saving and loading of session data with validation
 * Now supports per-tab isolation to prevent data bleeding between tabs
 * Uses plain localStorage (no encryption)
 */

import type { FormatType, componentType, DiffOptions } from '../types/common';
import { safeJsonParse, isLocalStorageAvailable } from '@/utils/errorHandling';

// Generate tab-specific storage keys
// Note: Input data is stored in formatStorage with keys like diffsuite_input_1_{format}_{mode}
// SessionStorage only stores session metadata (format, options, etc.)
function getStorageKeys(tabId: componentType) {
  const prefix = `diffsuite-${tabId}-`;
  return {
    SESSION_ENABLED: 'diffsuite-preserve-session', // Global setting
    LEFT_FORMAT: `${prefix}left-format`,
    RIGHT_FORMAT: `${prefix}right-format`,
    DIFF_OPTIONS: `${prefix}diff-options`,
    LAST_SAVED: `${prefix}last-saved`,
  } as const;
}

// Type for saved session data
// Note: Input data is stored separately in formatStorage, not here
export interface SavedSessionData {
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
    return localStorage.getItem('diffsuite-preserve-session') === 'true';
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
    localStorage.setItem('diffsuite-preserve-session', String(enabled));
  } catch (error) {
    console.error('Failed to set session preserve setting:', error);
  }
}

/**
 * Save session metadata to localStorage (plain storage, no encryption) (tab-specific)
 * Note: Input data is stored separately in formatStorage, not here
 */
export function saveSessionData(
  tabId: componentType,
  data: Omit<SavedSessionData, 'savedAt'>
): void {
  if (!isLocalStorageAvailable()) {
    return;
  }

  try {
    // Only save if preservation is enabled
    if (!isSessionPreserveEnabled()) {
      return;
    }

    const now = new Date().toISOString();
    const keys = getStorageKeys(tabId);

    // Only save session metadata, not input data (input data is in formatStorage)
    localStorage.setItem(keys.LEFT_FORMAT, data.leftFormat);
    localStorage.setItem(keys.RIGHT_FORMAT, data.rightFormat);
    localStorage.setItem(keys.DIFF_OPTIONS, JSON.stringify(data.diffOptions));
    localStorage.setItem(keys.LAST_SAVED, now);

    // eslint-disable-next-line no-console
    console.log(`✅ Session metadata saved for ${tabId} at:`, now);
  } catch (error) {
    console.error(`Failed to save session data for ${tabId}:`, error);
    
    // Check for quota exceeded error
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      console.error('Storage quota exceeded!');
    }
  }
}

/**
 * Load session metadata from localStorage (plain storage, no decryption) (tab-specific)
 * Note: Input data is loaded separately from formatStorage, not here
 */
export function loadSessionData(tabId: componentType): SavedSessionData | null {
  if (!isLocalStorageAvailable()) {
    return null;
  }

  try {
    // Check if preservation is enabled
    if (!isSessionPreserveEnabled()) {
      return null;
    }

    const keys = getStorageKeys(tabId);

    // Load only session metadata, not input data (input data is in formatStorage)
    const leftFormat = localStorage.getItem(keys.LEFT_FORMAT);
    const rightFormat = localStorage.getItem(keys.RIGHT_FORMAT);
    const diffOptionsStr = localStorage.getItem(keys.DIFF_OPTIONS);
    const savedAt = localStorage.getItem(keys.LAST_SAVED);

    // If no metadata exists for this tab, return null
    if (!diffOptionsStr && !leftFormat && !rightFormat) {
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
 * Get the last saved timestamp for a specific tab
 */
export function getLastSavedTime(tabId: componentType): string | null {
  if (!isLocalStorageAvailable()) {
    return null;
  }

  try {
    const keys = getStorageKeys(tabId);
    return localStorage.getItem(keys.LAST_SAVED);
  } catch {
    return null;
  }
}

/**
 * Clear session data for a specific tab
 */
export function clearSessionData(tabId: componentType): void {
  if (!isLocalStorageAvailable()) {
    return;
  }

  try {
    const keys = getStorageKeys(tabId);
    // Only clear session metadata, not input data (input data is in formatStorage)
    localStorage.removeItem(keys.LEFT_FORMAT);
    localStorage.removeItem(keys.RIGHT_FORMAT);
    localStorage.removeItem(keys.DIFF_OPTIONS);
    localStorage.removeItem(keys.LAST_SAVED);
    // eslint-disable-next-line no-console
    console.log(`✅ Session metadata cleared for ${tabId}`);
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
    const globalValue = localStorage.getItem('diffsuite-preserve-session');
    if (globalValue) {
      totalSize += 'diffsuite-preserve-session'.length + globalValue.length;
    }
    
    return totalSize * 2; // UTF-16 uses 2 bytes per character
  } catch {
    return 0;
  }
}


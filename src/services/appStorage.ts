/**
 * App-level storage service
 * Handles global application state like active tab selection
 */

import { isLocalStorageAvailable } from '@/utils/errorHandling';

// Storage keys
const STORAGE_KEYS = {
  ACTIVE_TAB: 'app-active-tab',
} as const;

/**
 * Save the currently active tab
 */
export function saveActiveTab(tabKey: string): void {
  if (!isLocalStorageAvailable()) {
    return;
  }

  try {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_TAB, tabKey);
  } catch (error) {
    console.error('Failed to save active tab:', error);
  }
}

/**
 * Load the last active tab
 */
export function loadActiveTab(): string | null {
  if (!isLocalStorageAvailable()) {
    return null;
  }

  try {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_TAB);
  } catch (error) {
    console.error('Failed to load active tab:', error);
    return null;
  }
}


/**
 * Format-based storage service for DiffChecker
 * Stores data separately for JSON, XML, and Text formats
 * Used to persist content across tab switches and page refreshes
 * Uses plain localStorage (no encryption) with keys matching the pattern:
 * - diffchecker_input_1_{format}_{mode} (left input for compare, single input for validate)
 * - diffchecker_input_2_{format}_{mode} (right input for compare only)
 */

import type { componentType } from '../types/common';
import { isLocalStorageAvailable, formatBytes } from '@/utils/errorHandling';

// Maximum size per input (2MB)
const MAX_INPUT_SIZE = 2 * 1024 * 1024; // 2MB per input

// Generate storage keys based on componentType
function getStorageKeys(tabId: componentType) {
  // Extract format and mode from tabId
  // tabId format: '{format}-{mode}' (e.g., 'json-compare', 'xml-validate')
  const [format, mode] = tabId.split('-') as [string, string];
  
  return {
    LEFT_INPUT: `diffchecker_input_1_${format}_${mode}`, // Left input for compare, single input for validate
    RIGHT_INPUT: `diffchecker_input_2_${format}_${mode}`, // Right input for compare only
  } as const;
}

// Type for saved format data
export interface SavedFormatData {
  leftInput: string;
  rightInput: string;
}

/**
 * Check if input size is within limits
 */
function checkInputSize(input: string, inputName: string): void {
  const size = new TextEncoder().encode(input).length;
  if (size > MAX_INPUT_SIZE) {
    const sizeMB = formatBytes(size);
    const maxMB = formatBytes(MAX_INPUT_SIZE);
    throw new Error(
      `${inputName} is too large (${sizeMB}). Maximum allowed size is ${maxMB}. ` +
      'Please reduce the content size or disable format storage.'
    );
  }
}

/**
 * Save format data to localStorage (plain storage, no encryption)
 * 
 * IMPORTANT: Each format (JSON, XML, Text) maintains separate storage keys.
 * Saving XML content will NEVER overwrite or remove JSON keys, and vice versa.
 * Each format only writes to its own format-specific keys:
 * - JSON compare: diffchecker_input_1_json_compare, diffchecker_input_2_json_compare
 * - XML compare: diffchecker_input_1_xml_compare, diffchecker_input_2_xml_compare
 * - Text compare: diffchecker_input_1_text_compare, diffchecker_input_2_text_compare
 * - JSON validate: diffchecker_input_1_json_validate
 * - XML validate: diffchecker_input_1_xml_validate
 */
export function saveFormatData(
  tabId: componentType,
  leftInput: string,
  rightInput: string
): void {
  if (!isLocalStorageAvailable()) {
    return;
  }

  // Check input sizes before attempting to save
  try {
    checkInputSize(leftInput, 'Left input');
    checkInputSize(rightInput, 'Right input');
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn(`Cannot save format data for ${tabId}:`, error instanceof Error ? error.message : error);
    return; // Don't attempt to save if inputs are too large
  }

  try {
    const keys = getStorageKeys(tabId);

    // Save left input (always saved) - only writes to format-specific key
    // e.g., for XML: diffchecker_input_1_xml_compare (will NOT touch JSON keys)
    localStorage.setItem(keys.LEFT_INPUT, leftInput);

    // Save right input only for compare mode (not for validate mode)
    const isCompareMode = tabId.includes('-compare');
    if (isCompareMode) {
      // Only writes to format-specific key
      // e.g., for XML: diffchecker_input_2_xml_compare (will NOT touch JSON keys)
      localStorage.setItem(keys.RIGHT_INPUT, rightInput);
    } else {
      // For validate mode, remove right input key if it exists (only for this format)
      localStorage.removeItem(keys.RIGHT_INPUT);
    }

    // eslint-disable-next-line no-console
    console.log(`✅ Format data saved for ${tabId} (keys: ${keys.LEFT_INPUT}, ${keys.RIGHT_INPUT})`);
  } catch (error) {
    // Check for quota exceeded error
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      // eslint-disable-next-line no-console
      console.error(
        `Storage quota exceeded for ${tabId}. ` +
        'Cannot save data. Each format maintains separate storage keys and will not overwrite other formats. ' +
        'Please clear browser storage or reduce content size.'
      );
      // Do NOT clear other formats - each format should maintain its own data independently
    } else {
      console.error(`Failed to save format data for ${tabId}:`, error);
    }
  }
}

/**
 * Load format data from localStorage (plain storage, no decryption)
 */
export function loadFormatData(tabId: componentType): SavedFormatData | null {
  if (!isLocalStorageAvailable()) {
    return null;
  }

  try {
    const keys = getStorageKeys(tabId);

    // Load each input separately to handle cases where one might fail
    let leftInput = '';
    let rightInput = '';

    try {
      const leftResult = localStorage.getItem(keys.LEFT_INPUT);
      leftInput = leftResult || '';
    } catch (leftError) {
      // eslint-disable-next-line no-console
      console.warn(`Failed to load left input for ${tabId}:`, leftError);
      leftInput = '';
    }

    // Only load right input for compare mode
    const isCompareMode = tabId.includes('-compare');
    if (isCompareMode) {
      try {
        const rightResult = localStorage.getItem(keys.RIGHT_INPUT);
        rightInput = rightResult || '';
      } catch (rightError) {
        // eslint-disable-next-line no-console
        console.warn(`Failed to load right input for ${tabId}:`, rightError);
        rightInput = '';
      }
    }

    // Return data even if only one input loaded successfully
    // This allows partial restoration if one input is corrupted
    if (leftInput || rightInput) {
      return {
        leftInput,
        rightInput,
      };
    }

    return null;
  } catch (error) {
    console.error(`Failed to load format data for ${tabId}:`, error);
    return null;
  }
}

/**
 * Clear format data for a specific tab
 */
export function clearFormatData(tabId: componentType): void {
  if (!isLocalStorageAvailable()) {
    return;
  }

  try {
    const keys = getStorageKeys(tabId);
    localStorage.removeItem(keys.LEFT_INPUT);
    localStorage.removeItem(keys.RIGHT_INPUT);
    // eslint-disable-next-line no-console
    console.log(`✅ Format data cleared for ${tabId}`);
  } catch (error) {
    console.error(`Failed to clear format data for ${tabId}:`, error);
  }
}

/**
 * Clear all format data for all tabs
 */
export function clearAllFormatData(): void {
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
      clearFormatData(tabId);
    });

    // eslint-disable-next-line no-console
    console.log('✅ All format data cleared');
  } catch (error) {
    console.error('Failed to clear all format data:', error);
  }
}

/**
 * Common utilities for JSON, XML, and Text comparison
 */

import type { ComparisonOptions, DiffLine } from '../types/common';

/**
 * Normalizes a key for comparison based on case sensitivity option
 */
export function normalizeKey(key: string, caseSensitive: boolean): string {
  return caseSensitive ? key : key.toLowerCase();
}

/**
 * Normalizes whitespace in a string (collapses multiple spaces, removes tabs/newlines, trims)
 */
export function normalizeWhitespace(str: string): string {
  return str.trim().replace(/[\s\t\n\r]+/g, ' ').trim();
}

/**
 * Normalizes a string value based on comparison options
 */
export function normalizeString(str: string, options: ComparisonOptions): string {
  let normalized = str;
  
  // Apply whitespace normalization
  if (options.ignoreWhitespace) {
    normalized = normalized.trim().replace(/[\s\t\n\r]+/g, ' ').trim();
  }
  
  // Apply case sensitivity
  if (!options.caseSensitive) {
    normalized = normalized.toLowerCase();
  }
  
  return normalized;
}

/**
 * Counts differences from diff lines
 */
export function countDifferences(diffLines: DiffLine[]): {
  addedCount: number;
  removedCount: number;
  modifiedCount: number;
  totalCount: number;
} {
  const addedCount = diffLines.filter(d => d.type === 'added').length;
  const removedCount = diffLines.filter(d => d.type === 'removed').length;
  const modifiedCount = diffLines.filter(d => d.type === 'modified').length;
  const totalCount = addedCount + removedCount + modifiedCount;

  return {
    addedCount,
    removedCount,
    modifiedCount,
    totalCount,
  };
}


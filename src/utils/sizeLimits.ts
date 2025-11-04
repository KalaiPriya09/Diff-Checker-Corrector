/**
 * Size limit constants and utilities
 */

export const MAX_INPUT_SIZE = 2 * 1024 * 1024; // 2 MB in bytes

/**
 * Calculate the size of a string in bytes (UTF-8 encoding)
 */
export function getStringSizeInBytes(str: string): number {
  return new TextEncoder().encode(str).length;
}

/**
 * Check if content size exceeds the maximum allowed size
 */
export function exceedsMaxSize(content: string): boolean {
  return getStringSizeInBytes(content) > MAX_INPUT_SIZE;
}

/**
 * Format size in human-readable format
 */
export function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}


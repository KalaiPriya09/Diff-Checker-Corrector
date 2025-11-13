/**
 * Error handling utilities for localStorage operations
 */

export class StorageError extends Error {
  constructor(message: string, public originalError?: unknown) {
    super(message);
    this.name = 'StorageError';
  }
}

/**
 * Check if localStorage is available
 */
export function isLocalStorageAvailable(): boolean {
  try {
    if (typeof window === 'undefined') {
      return false;
    }
    
    const testKey = '__localStorage_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get storage quota information (if available)
 */
export async function getStorageQuota(): Promise<{
  usage: number;
  quota: number;
  percentage: number;
} | null> {
  if (typeof navigator === 'undefined') {
    return null;
  }

  if ('storage' in navigator && 'estimate' in navigator.storage) {
    try {
      const estimate = await navigator.storage.estimate();
      const usage = estimate.usage || 0;
      const quota = estimate.quota || 0;
      const percentage = quota > 0 ? (usage / quota) * 100 : 0;
      
      return {
        usage,
        quota,
        percentage,
      };
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * Format bytes to human-readable format
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Handle storage quota exceeded errors
 */
export function handleQuotaExceeded(): void {
  if (typeof window !== 'undefined') {
    // eslint-disable-next-line no-alert
    alert(
      'Storage quota exceeded. Your session cannot be saved.\n\n' +
      'Try clearing old data or disable session preservation.'
    );
  }
}

/**
 * Safe JSON parse with fallback
 */
export function safeJsonParse<T>(
  jsonString: string,
  fallback: T
): T {
  try {
    return JSON.parse(jsonString) as T;
  } catch {
    return fallback;
  }
}

/**
 * Calculate approximate size of data in localStorage
 */
export function getStorageSize(): number {
  if (typeof window === 'undefined') {
    return 0;
  }

  try {
    let totalSize = 0;
    for (const key in localStorage) {
      if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
        const value = localStorage[key];
        totalSize += key.length + value.length;
      }
    }
    return totalSize * 2; // UTF-16 uses 2 bytes per character
  } catch {
    return 0;
  }
}


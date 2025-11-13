import type { componentType, SessionData } from '../types/common';
import { isLocalStorageAvailable, safeJsonParse, StorageError } from '../utils/errorHandling';

export type { componentType, SessionData };

class Encryption {
  static encrypt(data: string): string {
    if (typeof window === 'undefined') return data;
    try {
      const encoded = btoa(unescape(encodeURIComponent(data)));
      return encoded;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Encryption error:', error);
      return data;
    }
  }

  static decrypt(encrypted: string): string {
    if (typeof window === 'undefined') return encrypted;
    try {
      const decoded = decodeURIComponent(escape(atob(encrypted)));
      return decoded;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Decryption error:', error);
      return encrypted;
    }
  }
}

export class EncryptedStorage {
  private static readonly STORAGE_PREFIX = 'diff_checker_';
  private static readonly STORAGE_KEYS = {
    'json-validate': 'json_validate_session',
    'json-compare': 'json_compare_session',
    'xml-validate': 'xml_validate_session',
    'xml-compare': 'xml_compare_session',
    'text-compare': 'text_compare_session',
  } as const;

  private static getStorageKey(componentType: componentType): string {
    return `${this.STORAGE_PREFIX}${this.STORAGE_KEYS[componentType]}`;
  }

  static async saveSession(
    componentType: componentType, 
    data: Omit<SessionData, 'timestamp' | 'componentType'>
  ): Promise<void> {
    if (typeof window === 'undefined' || !isLocalStorageAvailable()) {
      return;
    }

    // Prepare session data outside try block so it's accessible in catch
    const sessionData: SessionData = {
      ...data,
      timestamp: Date.now(),
      componentType,
    };

    try {
      const encrypted = Encryption.encrypt(JSON.stringify(sessionData));
      window.sessionStorage.setItem(this.getStorageKey(componentType), encrypted);
    } catch (error) {
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        // Try to clear old sessions to make room
        try {
          // Clear all other sessions except the current one
          Object.entries(this.STORAGE_KEYS).forEach(([key, storageKey]) => {
            if (key !== componentType) {
              window.sessionStorage.removeItem(`${this.STORAGE_PREFIX}${storageKey}`);
            }
          });
          
          // Try saving again after clearing
          const encrypted = Encryption.encrypt(JSON.stringify(sessionData));
          window.sessionStorage.setItem(this.getStorageKey(componentType), encrypted);
          return; // Success after clearing
        } catch (retryError) {
          // Still failed, throw the error
          throw new StorageError(
            `Storage quota exceeded. Cannot save ${componentType} session. Please clear some data or disable session storage.`,
            retryError
          );
        }
      }
      throw new StorageError(
        `Error saving ${componentType} session`,
        error
      );
    }
  }

  static async loadSession(componentType: componentType): Promise<SessionData | null> {
    if (typeof window === 'undefined' || !isLocalStorageAvailable()) {
      return null;
    }

    try {
      const encrypted = window.sessionStorage.getItem(this.getStorageKey(componentType));
      if (!encrypted) return null;

      const decrypted = Encryption.decrypt(encrypted);
      const data = safeJsonParse<SessionData>(decrypted, {
        timestamp: 0,
        componentType,
      } as SessionData);
      
      if (data.componentType !== componentType) {
        // eslint-disable-next-line no-console
        console.warn(`Session data type mismatch: expected ${componentType}, got ${data.componentType}`);
        return null;
      }

      return data;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`Error loading ${componentType} session:`, error);
      return null;
    }
  }

  static async clearSession(componentType: componentType): Promise<void> {
    if (typeof window === 'undefined' || !isLocalStorageAvailable()) {
      return;
    }
    
    try {
      window.sessionStorage.removeItem(this.getStorageKey(componentType));
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`Error clearing ${componentType} session:`, error);
    }
  }

  static async clearAllSessions(): Promise<void> {
    if (typeof window === 'undefined' || !isLocalStorageAvailable()) {
      return;
    }
    
    try {
      Object.values(this.STORAGE_KEYS).forEach(key => {
        window.sessionStorage.removeItem(`${this.STORAGE_PREFIX}${key}`);
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error clearing all sessions:', error);
    }
  }

  static hasSession(componentType: componentType): boolean {
    if (typeof window === 'undefined' || !isLocalStorageAvailable()) {
      return false;
    }
    try {
      return window.sessionStorage.getItem(this.getStorageKey(componentType)) !== null;
    } catch {
      return false;
    }
  }
}


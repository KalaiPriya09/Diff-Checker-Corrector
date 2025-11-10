import type { ComponentType, SessionData } from '../types/common';

export type { ComponentType, SessionData };

class Encryption {
  static encrypt(data: string): string {
    if (typeof window === 'undefined') return data;
    try {
      const encoded = btoa(unescape(encodeURIComponent(data)));
      return encoded;
    } catch {
      return data;
    }
  }

  static decrypt(encrypted: string): string {
    if (typeof window === 'undefined') return encrypted;
    try {
      const decoded = decodeURIComponent(escape(atob(encrypted)));
      return decoded;
    } catch {
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

  private static getStorageKey(componentType: ComponentType): string {
    return `${this.STORAGE_PREFIX}${this.STORAGE_KEYS[componentType]}`;
  }

  static async saveSession(
    componentType: ComponentType, 
    data: Omit<SessionData, 'timestamp' | 'componentType'>
  ): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
      const sessionData: SessionData = {
        ...data,
        timestamp: Date.now(),
        componentType,
      };

      const encrypted = Encryption.encrypt(JSON.stringify(sessionData));
      window.sessionStorage.setItem(this.getStorageKey(componentType), encrypted);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`Error saving ${componentType} session:`, error);
      throw error;
    }
  }

  static async loadSession(componentType: ComponentType): Promise<SessionData | null> {
    if (typeof window === 'undefined') return null;

    try {
      const encrypted = window.sessionStorage.getItem(this.getStorageKey(componentType));
      if (!encrypted) return null;

      const decrypted = Encryption.decrypt(encrypted);
      const data = JSON.parse(decrypted) as SessionData;
      
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

  static async clearSession(componentType: ComponentType): Promise<void> {
    if (typeof window === 'undefined') return;
    
    try {
      window.sessionStorage.removeItem(this.getStorageKey(componentType));
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`Error clearing ${componentType} session:`, error);
    }
  }

  static async clearAllSessions(): Promise<void> {
    if (typeof window === 'undefined') return;
    
    try {
      Object.values(this.STORAGE_KEYS).forEach(key => {
        window.sessionStorage.removeItem(`${this.STORAGE_PREFIX}${key}`);
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error clearing all sessions:', error);
    }
  }

  static hasSession(componentType: ComponentType): boolean {
    if (typeof window === 'undefined') return false;
    return window.sessionStorage.getItem(this.getStorageKey(componentType)) !== null;
  }
}


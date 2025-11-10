/**
 * LocalStorage wrapper with type safety and error handling
 */
export class Storage {
  /**
   * Get item from localStorage
   */
  static get<T>(key: string): T | null {
    if (typeof window === 'undefined') return null;

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`Error reading from localStorage: ${error}`);
      return null;
    }
  }

  /**
   * Set item in localStorage
   */
  static set<T>(key: string, value: T): void {
    if (typeof window === 'undefined') return;

    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`Error writing to localStorage: ${error}`);
    }
  }

  /**
   * Remove item from localStorage
   */
  static remove(key: string): void {
    if (typeof window === 'undefined') return;

    try {
      window.localStorage.removeItem(key);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`Error removing from localStorage: ${error}`);
    }
  }

  /**
   * Clear all items from localStorage
   */
  static clear(): void {
    if (typeof window === 'undefined') return;

    try {
      window.localStorage.clear();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`Error clearing localStorage: ${error}`);
    }
  }
}

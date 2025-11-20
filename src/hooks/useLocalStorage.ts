/**
 * Custom hook for localStorage with JSON serialization
 * Handles errors gracefully and provides type safety
 */

import { useState, useEffect, useCallback } from 'react';

/**
 * useLocalStorage Hook
 * 
 * A custom React hook that syncs state with localStorage.
 * Automatically serializes/deserializes JSON and handles errors.
 * 
 * @param key - The localStorage key
 * @param initialValue - The initial value if nothing is stored
 * @returns [storedValue, setValue, removeValue]
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load initial value from localStorage on mount
  useEffect(() => {
    if (isInitialized) return;

    try {
      // Check if localStorage is available
      if (typeof window === 'undefined') {
        return;
      }

      const item = window.localStorage.getItem(key);
      if (item !== null) {
        const parsed = JSON.parse(item);
        setStoredValue(parsed);
      }
    } catch (error) {
      console.warn(`Error loading localStorage key "${key}":`, error);
      // If error, keep the initial value
    } finally {
      setIsInitialized(true);
    }
  }, [key, isInitialized]);

  // Save to localStorage
  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        // Allow value to be a function for consistency with useState
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        
        setStoredValue(valueToStore);
        
        // Save to localStorage
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
      } catch (error) {
        console.error(`Error saving to localStorage key "${key}":`, error);
        
        // Check if it's a quota exceeded error
        if (error instanceof Error && error.name === 'QuotaExceededError') {
          console.error('LocalStorage quota exceeded!');
        }
      }
    },
    [key, storedValue]
  );

  // Remove from localStorage
  const removeValue = useCallback(() => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
      }
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
}


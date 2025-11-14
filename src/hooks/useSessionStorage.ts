/**
 * useSessionStorage Hook
 * 
 * Manages session storage for diff checker components with:
 * - Auto-save with debouncing (1 second delay)
 * - Per-componentType isolation
 * - Automatic restore on mount
 * - Cleanup on unmount/format change
 */

import { useEffect, useRef, useCallback } from 'react';
import { EncryptedStorage } from '../services/encryptedStorage';
import { StorageError } from '../utils/errorHandling';
import type { componentType, SessionData, FormatType, DiffOptions } from '../types/common';

export interface UseSessionStorageOptions {
  componentType: componentType;
  enabled?: boolean;
  autoSaveDelay?: number;
  leftInput: string;
  rightInput: string;
  format: FormatType;
  diffOptions: DiffOptions;
  setLeftInput: (value: string) => void;
  setRightInput: (value: string) => void;
  onRestore?: (sessionData: SessionData) => void;
}

export interface UseSessionStorageReturn {
  isRestored: boolean;
  clearSession: () => Promise<void>;
}

/**
 * Custom hook for managing session storage per component type
 * Each format (json-compare, xml-compare, etc.) has isolated storage
 */
export const useSessionStorage = ({
  componentType,
  enabled = true,
  autoSaveDelay = 1000,
  leftInput,
  rightInput,
  format,
  diffOptions,
  setLeftInput,
  setRightInput,
  onRestore,
}: UseSessionStorageOptions): UseSessionStorageReturn => {
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialMountRef = useRef(true);
  const isSavingRef = useRef(false);
  const isRestoredRef = useRef(false);
  const previousComponentTypeRef = useRef<componentType | null>(null);

  // Load session on mount or when componentType changes
  useEffect(() => {
    if (!enabled) return;

    const loadSession = async () => {
      try {
        const previousType = previousComponentTypeRef.current;
        const isFormatSwitch = previousType && previousType !== componentType && !isInitialMountRef.current;

        // If componentType changed, save previous session first
        if (isFormatSwitch) {
          // Save previous session before switching
          // Use current state values for the previous componentType
          try {
            await EncryptedStorage.saveSession(previousType, {
              leftInput,
              rightInput,
              format,
              comparisonOptions: diffOptions,
            });
          } catch (error) {
            // Handle storage errors gracefully - don't block format switching
            if (error instanceof StorageError) {
              // eslint-disable-next-line no-console
              console.warn('Could not save previous session:', error.message);
            } else {
              // eslint-disable-next-line no-console
              console.error('Error saving previous session:', error);
            }
          }
        }

        // Load session for current componentType
        const sessionData = await EncryptedStorage.loadSession(componentType);
        
        if (sessionData && onRestore) {
          // Restore state from session
          onRestore(sessionData);
          isRestoredRef.current = true;
        } else {
          // No session found for this componentType
          // Clear inputs when switching to a different componentType (not on initial mount)
          if (isFormatSwitch) {
            setLeftInput('');
            setRightInput('');
          }
          isRestoredRef.current = false;
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error loading session:', error);
        isRestoredRef.current = false;
      } finally {
        if (isInitialMountRef.current) {
          isInitialMountRef.current = false;
        }
        previousComponentTypeRef.current = componentType;
      }
    };

    loadSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [componentType, enabled, onRestore]);

  // Save session function
  const saveSession = useCallback(
    async (targetComponentType: componentType = componentType) => {
      if (!enabled) return;
      if (isSavingRef.current) return; // Prevent concurrent saves

      // Limit input size to prevent storage quota issues
      // Estimate: each character is ~2 bytes, so 500KB = ~250,000 characters
      const MAX_INPUT_SIZE = 250000; // ~500KB per input
      const shouldTruncateLeft = leftInput.length > MAX_INPUT_SIZE;
      const shouldTruncateRight = rightInput.length > MAX_INPUT_SIZE;

      // If inputs are too large, don't save to prevent quota issues
      if (shouldTruncateLeft || shouldTruncateRight) {
        // eslint-disable-next-line no-console
        console.warn('Input too large for session storage, skipping save');
        return;
      }

      try {
        isSavingRef.current = true;

        await EncryptedStorage.saveSession(targetComponentType, {
          leftInput,
          rightInput,
          format,
          comparisonOptions: diffOptions,
        });
      } catch (error) {
        // Handle storage quota exceeded gracefully
        if (error instanceof StorageError) {
          // eslint-disable-next-line no-console
          console.warn('Session storage quota exceeded:', error.message);
          // Don't show alert on every save attempt - only log to console
          // The user can continue using the app without session storage
        } else {
          // eslint-disable-next-line no-console
          console.error('Error saving session:', error);
        }
      } finally {
        isSavingRef.current = false;
      }
    },
    [enabled, leftInput, rightInput, format, diffOptions, componentType]
  );

  // Debounced save function
  const debouncedSave = useCallback(() => {
    if (!enabled) return;
    if (isInitialMountRef.current) return; // Skip on first render

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set new timeout
    saveTimeoutRef.current = setTimeout(() => {
      saveSession();
    }, autoSaveDelay);
  }, [enabled, autoSaveDelay, saveSession]);

  // Auto-save on state changes
  useEffect(() => {
    debouncedSave();

    // Cleanup timeout on unmount or dependency change
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [leftInput, rightInput, format, diffOptions, debouncedSave]);

  // Save on unmount or componentType change
  useEffect(() => {
    return () => {
      // Clear pending save
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      // Save immediately if there's a pending save
      if (isSavingRef.current === false) {
        saveSession();
      }
    };
  }, [componentType, saveSession]);

  // Clear session function
  const clearSession = useCallback(async () => {
    try {
      await EncryptedStorage.clearSession(componentType);
      isRestoredRef.current = false;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error clearing session:', error);
    }
  }, [componentType]);

  return {
    isRestored: isRestoredRef.current,
    clearSession,
  };
};


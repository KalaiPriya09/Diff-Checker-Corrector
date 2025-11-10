import { useEffect, useRef, useCallback, useState } from 'react';
import { EncryptedStorage } from '../services/encryptedStorage';
import type { ComponentType, SessionData, ComparisonOptions } from '../types/common';

interface UseSessionStorageOptions {
  componentType: ComponentType;
  input?: string;
  leftInput?: string;
  rightInput?: string;
  comparisonOptions?: ComparisonOptions;
  autoSaveDelay?: number;
  enabled?: boolean;
}

interface UseSessionStorageReturn {
  saveSession: () => Promise<void>;
  loadSession: () => Promise<SessionData | null>;
  clearSession: () => Promise<void>;
  isRestored: boolean;
}

export function useSessionStorage({
  componentType,
  input,
  leftInput,
  rightInput,
  comparisonOptions,
  autoSaveDelay = 1000,
  enabled = true,
}: UseSessionStorageOptions): UseSessionStorageReturn {
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isRestored, setIsRestored] = useState(false);
  const isInitialMountRef = useRef(true);
  const isSavingRef = useRef(false);

  const saveSession = useCallback(async () => {
    if (!enabled || isSavingRef.current) return;

    try {
      isSavingRef.current = true;
      await EncryptedStorage.saveSession(componentType, {
        input,
        leftInput,
        rightInput,
        comparisonOptions,
        format: componentType.includes('json') ? 'json' : componentType.includes('xml') ? 'xml' : 'text',
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to save session:', error);
    } finally {
      isSavingRef.current = false;
    }
  }, [componentType, input, leftInput, rightInput, comparisonOptions, enabled]);

  const debouncedSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      saveSession();
    }, autoSaveDelay);
  }, [saveSession, autoSaveDelay]);

  const loadSession = useCallback(async (): Promise<SessionData | null> => {
    if (!enabled) return null;

    try {
      const session = await EncryptedStorage.loadSession(componentType);
      if (session) {
        setIsRestored(true);
      }
      return session;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to load session:', error);
      return null;
    }
  }, [componentType, enabled]);

  const clearSession = useCallback(async () => {
    try {
      await EncryptedStorage.clearSession(componentType);
      setIsRestored(false);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to clear session:', error);
    }
  }, [componentType]);

  useEffect(() => {
    if (!enabled || isInitialMountRef.current) {
      isInitialMountRef.current = false;
      return;
    }

    debouncedSave();

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [input, leftInput, rightInput, comparisonOptions, debouncedSave, enabled]);

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      if (isSavingRef.current) {
        saveSession();
      }
    };
  }, [saveSession]);

  return {
    saveSession,
    loadSession,
    clearSession,
    isRestored,
  };
}


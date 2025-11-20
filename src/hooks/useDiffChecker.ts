/**
 * useDiffChecker Hook
 *
 * Manages state and logic for the diff checker functionality
 */
import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { validateJSON } from '../utils/jsonValidation';
import { validateXML } from '../utils/xmlValidation';
import { validateText } from '../utils/textValidation';
import { compareJSON } from '../utils/jsonComparison';
import { compareXML } from '../utils/xmlComparison';
import { compareText } from '../utils/textComparison';
import { DiffResult } from '../utils/diffChecker';
import { normalizeXML } from '../utils/xmlValidation';
import {
  saveSessionData,
  loadSessionData,
  isSessionPreserveEnabled,
  clearSessionData,
  setSessionPreserveEnabled
} from '@/services/sessionStorage';
import type { FormatType, ModeType, ValidationResult, DiffOptions } from '../types/common';

export interface DiffState {
  leftInput: string;
  rightInput: string;
  format: FormatType;
  mode: ModeType;
  leftValidation: ValidationResult | null;
  rightValidation: ValidationResult | null;
  diffResult: DiffResult | null;
  isComparing: boolean;
  diffOptions: DiffOptions;
  isSemantic: boolean;
  preserveSession: boolean;
}

const defaultDiffOptions: DiffOptions = {
  ignoreWhitespace: false,
  caseSensitive: true,
  ignoreKeyOrder: false,
  ignoreAttributeOrder: false,
  ignoreArrayOrder: false,
};

export const useDiffChecker = () => {
  const [state, setState] = useState<DiffState>({
    leftInput: '',
    rightInput: '',
    format: 'json',
    mode: 'compare',
    leftValidation: null,
    rightValidation: null,
    diffResult: null,
    isComparing: false,
    diffOptions: defaultDiffOptions,
    isSemantic: false,
    preserveSession: isSessionPreserveEnabled(),
  });
  const workerRef = useRef<Worker | null>(null);

  // Initialize Web Worker (optional - for large files)
  useEffect(() => {
    // Create worker if needed for large file processing
    // For now, we'll use direct processing
    const worker = workerRef.current;
    return () => {
      worker?.terminate();
    };
  }, []);

  // Load saved session on mount (async)
  useEffect(() => {
    const loadSavedSession = async () => {
      const savedSession = await loadSessionData();
      
      if (savedSession) {
        // eslint-disable-next-line no-console
        console.log('📂 Loaded saved session (encrypted) from:', savedSession.savedAt);
        setState(prev => ({
          ...prev,
          leftInput: savedSession.leftInput,
          rightInput: savedSession.rightInput,
          format: savedSession.leftFormat, // Use leftFormat as the main format
          diffOptions: { ...defaultDiffOptions, ...savedSession.diffOptions },
          preserveSession: true,
        }));
      }
    };

    loadSavedSession();
  }, []); // Run once on mount

  // Auto-save session data when relevant state changes (async)
  useEffect(() => {
    if (!state.preserveSession) {
      return; // Only save if preservation is enabled
    }

    // Debounce saves to avoid excessive localStorage writes
    const timeoutId = setTimeout(async () => {
      await saveSessionData({
        leftInput: state.leftInput,
        rightInput: state.rightInput,
        leftFormat: state.format, // Use format for both left and right
        rightFormat: state.format,
        diffOptions: state.diffOptions,
      });
    }, 1000); // Save after 1 second of inactivity

    return () => clearTimeout(timeoutId); // Cleanup on unmount or dependency change
  }, [
    state.leftInput,
    state.rightInput,
    state.format,
    state.diffOptions,
    state.preserveSession,
  ]);

  // Update left input
  const setLeftInput = useCallback((input: string) => {
    setState((prev) => ({
      ...prev,
      leftInput: input,
      leftValidation: null,
      diffResult: null,
    }));
  }, []);

  // Update right input
  const setRightInput = useCallback((input: string) => {
    setState((prev) => ({
      ...prev,
      rightInput: input,
      rightValidation: null,
      diffResult: null,
    }));
  }, []);

  // Set format
  const setFormat = useCallback((format: FormatType) => {
    setState((prev) => ({
      ...prev,
      format,
      leftValidation: null,
      rightValidation: null,
      diffResult: null,
    }));
  }, []);

  // Set mode (compare or validate)
  const setMode = useCallback((mode: ModeType) => {
    setState((prev) => ({
      ...prev,
      mode,
      leftValidation: null,
      rightValidation: null,
      diffResult: null,
    }));
  }, []);

  // Update diff options
  const setDiffOptions = useCallback((options: Partial<DiffOptions>) => {
    setState((prev) => ({
      ...prev,
      diffOptions: { ...prev.diffOptions, ...options },
      diffResult: null, // Clear result to trigger re-comparison
    }));
  }, []);

  // Set semantic mode
  const setIsSemantic = useCallback((isSemantic: boolean) => {
    setState((prev) => ({
      ...prev,
      isSemantic,
    }));
  }, []);

  // Toggle session preservation
  const togglePreserveSession = useCallback((enabled: boolean) => {
    setState((prev) => ({
      ...prev,
      preserveSession: enabled,
    }));
  }, []);

  // Validate format
  const validateFormat = useCallback(
    (input: string, format: FormatType): ValidationResult => {
      if (format === 'json') {
        return validateJSON(input);
      } else if (format === 'xml') {
        return validateXML(input);
      } else {
        return validateText(input);
      }
    },
    []
  );

  // Validate both inputs
  const validateInputs = useCallback(() => {
    const leftValidation = validateFormat(state.leftInput, state.format);
    const rightValidation = validateFormat(state.rightInput, state.format);

    setState((prev) => ({
      ...prev,
      leftValidation,
      rightValidation,
    }));

    return {
      left: leftValidation,
      right: rightValidation,
      bothValid: leftValidation.isValid && rightValidation.isValid,
    };
  }, [state.leftInput, state.rightInput, state.format, validateFormat]);

  // Compare inputs and generate diff
  const compare = useCallback(async () => {
    setState((prev) => ({ ...prev, isComparing: true }));

    // Yield to browser to show loading state
    await new Promise((resolve) => setTimeout(resolve, 0));

    // Validation mode
    if (state.mode === 'validate') {
      const leftValidation = validateFormat(state.leftInput, state.format);

      setState((prev) => ({
        ...prev,
        leftValidation,
        rightValidation: null,
        diffResult: null,
        isComparing: false,
      }));

      return {
        success: leftValidation.isValid,
        error: leftValidation.error,
      };
    }

    // Comparison mode
    const leftValidation = validateFormat(state.leftInput, state.format);
    const rightValidation = validateFormat(state.rightInput, state.format);

    if (!leftValidation.isValid || !rightValidation.isValid) {
      setState((prev) => ({
        ...prev,
        leftValidation,
        rightValidation,
        diffResult: null,
        isComparing: false,
      }));

      return { success: false, error: 'Invalid input' };
    }

    // For XML, when ignoreWhitespace is false, we need to pass original input to preserve formatting
    // For other formats or when ignoreWhitespace is true, use formatted version
    let leftText: string;
    let rightText: string;
    
    if (state.format === 'xml' && !state.diffOptions.ignoreWhitespace) {
      // For XML with ignoreWhitespace=false, use original input to preserve formatting differences
      leftText = state.leftInput;
      rightText = state.rightInput;
    } else {
      // For other cases, use formatted version
      leftText = leftValidation.formatted || state.leftInput;
      rightText = rightValidation.formatted || state.rightInput;
    }

    // JSON key order and array order normalization
    // Note: This is now handled in compareJSON function, but we keep this
    // for backward compatibility and to ensure normalization happens before
    // the comparison function is called
    if ((state.diffOptions.ignoreKeyOrder || state.diffOptions.ignoreArrayOrder) && state.format === 'json') {
      try {
        await new Promise((resolve) => setTimeout(resolve, 0));
        // This normalization will be done again in compareJSON, but it's safe to do it here too
        // The compareJSON function will handle it properly
      } catch {
        // Use original text if parsing fails
      }
    }

    // XML attribute order normalization
    // Note: This is now handled in compareXML function, but we keep this
    // for backward compatibility. However, we skip it when ignoreWhitespace is false
    // to avoid double processing
    if (state.diffOptions.ignoreAttributeOrder && state.format === 'xml' && state.diffOptions.ignoreWhitespace) {
      try {
        await new Promise((resolve) => setTimeout(resolve, 0));
        leftText = normalizeXML(leftText);
        rightText = normalizeXML(rightText);
      } catch {
        // Use original text if normalization fails
      }
    }

    // Use Web Worker for files larger than 10KB
    const isLargeFile = leftText.length > 10000 || rightText.length > 10000;

    if (isLargeFile && workerRef.current) {
      try {
        const diffResult = await new Promise<DiffResult>((resolve, reject) => {
          const timeoutId = setTimeout(() => {
            reject(new Error('Worker timeout'));
          }, 30000); // 30 second timeout

          const handleMessage = (e: MessageEvent) => {
            clearTimeout(timeoutId);
            if (e.data.success) {
              resolve(e.data.result);
            } else {
              reject(new Error(e.data.error));
            }
            workerRef.current?.removeEventListener('message', handleMessage);
          };

          workerRef.current?.addEventListener('message', handleMessage);
          workerRef.current?.postMessage({
            type: 'COMPUTE_DIFF',
            payload: {
              left: leftText,
              right: rightText,
              options: state.diffOptions,
            },
          });
        });

        await new Promise((resolve) => requestAnimationFrame(resolve));

        setState((prev) => ({
          ...prev,
          leftValidation,
          rightValidation,
          diffResult,
          isComparing: false,
        }));

        return { success: true, diffResult };
      } catch {
        // Worker diff failed, falling back to async processing
        // eslint-disable-next-line no-console
        console.error('Worker diff failed, falling back to async processing');
        // Fall through to async processing
      }
    }

    // Async diff processing for smoother UI
    await new Promise((resolve) => setTimeout(resolve, 0));

    let diffResult: DiffResult;

    if (state.format === 'json') {
      const result = compareJSON(leftText, rightText, {
        ignoreKeyOrder: state.diffOptions.ignoreKeyOrder,
        ignoreArrayOrder: state.diffOptions.ignoreArrayOrder,
        ignoreWhitespace: state.diffOptions.ignoreWhitespace,
        caseSensitive: state.diffOptions.caseSensitive,
      });
      diffResult = result.diff || {
        leftLines: [],
        rightLines: [],
        hasChanges: false,
      };
    } else if (state.format === 'xml') {
      const result = compareXML(leftText, rightText, {
        ignoreAttributeOrder: state.diffOptions.ignoreAttributeOrder,
        ignoreWhitespace: state.diffOptions.ignoreWhitespace,
        caseSensitive: state.diffOptions.caseSensitive,
      });
      diffResult = result.diff || {
        leftLines: [],
        rightLines: [],
        hasChanges: false,
      };
    } else {
      const result = compareText(leftText, rightText, {
        ignoreWhitespace: state.diffOptions.ignoreWhitespace,
        caseSensitive: state.diffOptions.caseSensitive,
        textCompareMode: state.diffOptions.textCompareMode || 'line',
      });
      diffResult = result.diff || {
        leftLines: [],
        rightLines: [],
        hasChanges: false,
      };
    }

    // Use requestAnimationFrame for smooth state update
    await new Promise((resolve) => requestAnimationFrame(resolve));

    setState((prev) => ({
      ...prev,
      leftValidation,
      rightValidation,
      diffResult,
      isComparing: false,
    }));

    return { success: true, diffResult };
  }, [
    state.leftInput,
    state.rightInput,
    state.format,
    state.mode,
    state.diffOptions,
    validateFormat,
  ]);

  // Clear all inputs and results
  const clear = useCallback(async () => {
    setState((prev) => ({
      ...prev,
      leftInput: '',
      rightInput: '',
      leftValidation: null,
      rightValidation: null,
      diffResult: null,
      isComparing: false,
    }));
    
    // If session preservation is enabled, save the cleared state
    if (state.preserveSession) {
      await saveSessionData({
        leftInput: '',
        rightInput: '',
        leftFormat: state.format,
        rightFormat: state.format,
        diffOptions: state.diffOptions,
      });
    }
  }, [state.preserveSession, state.format, state.diffOptions]);

  // Reset to initial state and clear session storage
  const reset = useCallback(() => {
    setState({
      leftInput: '',
      rightInput: '',
      format: 'json',
      mode: 'compare',
      leftValidation: null,
      rightValidation: null,
      diffResult: null,
      isComparing: false,
      diffOptions: defaultDiffOptions,
      isSemantic: false,
      // Disable session storage
      preserveSession: false,
    });
    
    // Clear session storage data and disable the feature
    clearSessionData();
    setSessionPreserveEnabled(false);
  }, []);

  // Swap left and right inputs
  const swap = useCallback(() => {
    setState((prev) => ({
      ...prev,
      leftInput: prev.rightInput,
      rightInput: prev.leftInput,
      leftValidation: prev.rightValidation,
      rightValidation: prev.leftValidation,
      diffResult: prev.diffResult
        ? {
            leftLines: prev.diffResult.rightLines,
            rightLines: prev.diffResult.leftLines,
            hasChanges: prev.diffResult.hasChanges,
          }
        : null,
    }));
  }, []);

  // Check if inputs are ready to compare
  const canCompare = useMemo(() => {
    if (state.mode === 'validate') {
      return state.leftInput.trim().length > 0 && !state.isComparing;
    }
    return (
      state.leftInput.trim().length > 0 &&
      state.rightInput.trim().length > 0 &&
      !state.isComparing
    );
  }, [state.leftInput, state.rightInput, state.mode, state.isComparing]);

  return {
    ...state,
    setLeftInput,
    setRightInput,
    setFormat,
    setMode,
    setDiffOptions,
    setIsSemantic,
    validateInputs,
    compare,
    clear,
    reset,
    swap,
    canCompare,
    togglePreserveSession,
  };
};


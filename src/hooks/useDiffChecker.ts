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
  clearSessionData
} from '@/services/sessionStorage';
import {
  saveFormatData,
  loadFormatData
} from '@/services/formatStorage';
import type { FormatType, ModeType, ValidationResult, DiffOptions, componentType } from '../types/common';

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
}

const defaultDiffOptions: DiffOptions = {
  ignoreWhitespace: false,
  caseSensitive: true,
  ignoreKeyOrder: false,
  ignoreAttributeOrder: false,
  ignoreArrayOrder: false,
};

export const useDiffChecker = (tabId: componentType) => {
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
  });
  const workerRef = useRef<Worker | null>(null);
  const currentTabIdRef = useRef<componentType>(tabId);
  const isInitialMountRef = useRef<boolean>(true);
  const isInitialLoadCompleteRef = useRef<boolean>(false);
  const stateRef = useRef<DiffState>(state);
  
  // Keep ref in sync with state
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Initialize Web Worker (optional - for large files)
  useEffect(() => {
    // Create worker if needed for large file processing
    // For now, we'll use direct processing
    const worker = workerRef.current;
    return () => {
      worker?.terminate();
    };
  }, []);

  // Handle tab switching - save current content to formatStorage and clear state
  useEffect(() => {
    // If tab changed, save current content to formatStorage and clear state
    if (currentTabIdRef.current !== tabId) {
      const previousTabId = currentTabIdRef.current;
      const currentState = stateRef.current;
      currentTabIdRef.current = tabId;
      
      // Save current content to formatStorage before clearing (if not initial mount)
      if (!isInitialMountRef.current) {
        // Save to formatStorage based on previous tabId
        if (currentState.leftInput || currentState.rightInput) {
          try {
            saveFormatData(
              previousTabId,
              currentState.leftInput,
              currentState.rightInput
            );
          } catch (err) {
            // Errors are already handled in saveFormatData, but we catch here
            // to prevent unhandled promise rejections
            // eslint-disable-next-line no-console
            console.warn('Failed to save format data on tab switch (handled gracefully):', err);
          }
        }
      }
      
      // Clear state (localStorage persists)
      setState(prev => ({
        ...prev,
        leftInput: '',
        rightInput: '',
        leftValidation: null,
        rightValidation: null,
        diffResult: null,
        isComparing: false,
      }));
    }
  }, [tabId]);

  // Load saved format data on mount (page refresh) - only for initial tab
  useEffect(() => {
    const loadSavedFormatData = () => {
      // Only load on initial mount (page refresh)
      if (isInitialMountRef.current) {
        isInitialMountRef.current = false;
        
        // Load data for current tabId
        const savedData = loadFormatData(currentTabIdRef.current);
        if (savedData && (savedData.leftInput || savedData.rightInput)) {
          // eslint-disable-next-line no-console
          console.log(`📂 Loaded saved format data for ${currentTabIdRef.current}`);
          setState(prev => ({
            ...prev,
            leftInput: savedData.leftInput,
            rightInput: savedData.rightInput,
            // Don't override format - it's controlled by parent via activeFormat prop
            // format will be set by DiffChecker component's useLayoutEffect
          }));
        }
        
        // Mark initial load as complete after a short delay to allow state to settle
        // This ensures auto-save doesn't trigger during initial load
        setTimeout(() => {
          isInitialLoadCompleteRef.current = true;
        }, 200);
      }
    };

    loadSavedFormatData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount only


  // Auto-save format data to formatStorage when inputs change
  // This saves data separately for each tab (JSON compare, XML compare, etc.)
  // Saves on: copy, paste, upload, drag & drop, typing
  useEffect(() => {
    // Skip saving during initial load (we load from storage on mount)
    if (!isInitialLoadCompleteRef.current) {
      return;
    }

    // Debounce saves to avoid excessive localStorage writes
    const timeoutId = setTimeout(() => {
      // Only save if there's actual content
      if (state.leftInput || state.rightInput) {
        try {
          saveFormatData(
            tabId,
            state.leftInput,
            state.rightInput
          );
        } catch (err) {
          // Errors are already handled in saveFormatData, but we catch here
          // to prevent unhandled promise rejections
          // eslint-disable-next-line no-console
          console.warn('Format data save failed (handled gracefully):', err);
        }
      }
    }, 500); // Save after 500ms of inactivity

    return () => clearTimeout(timeoutId); // Cleanup on unmount or dependency change
  }, [
    tabId,
    state.leftInput,
    state.rightInput,
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

    // For JSON and XML, when ignoreWhitespace is false, we need to pass original input to preserve formatting
    // For other formats or when ignoreWhitespace is true, use formatted version
    let leftText: string;
    let rightText: string;
    
    if ((state.format === 'json' || state.format === 'xml') && !state.diffOptions.ignoreWhitespace) {
      // For JSON/XML with ignoreWhitespace=false, use original input to preserve formatting differences
      // The comparison functions will handle the original input correctly
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

  // Clear all inputs and results (Reset button)
  // Only clears state, does NOT touch localStorage
  const clear = useCallback(() => {
    // Clear state only - localStorage remains intact
    setState((prev) => ({
      ...prev,
      leftInput: '',
      rightInput: '',
      leftValidation: null,
      rightValidation: null,
      diffResult: null,
      isComparing: false,
    }));
  }, []);

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
    });
    
    // Clear session storage data for this tab
    clearSessionData(tabId);
  }, [tabId]);

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
  };
};


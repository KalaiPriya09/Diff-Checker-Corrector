import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { compareJSON } from '../../utils/jsonCompare';
import type { ComparisonOptions as ComponentComparisonOptions } from '../ComparisonOptions';
import type { ComparisonOptions } from '../../types/common';
import { useFileDrop } from '../../hooks/useFileDrop';
import { useSessionStorage } from '../../hooks/useSessionStorage';
import { getDefaultComparisonOptions } from '../../utils/comparisonOptionsDefaults';
import { Alert } from '../Alert';
import { validateContentSize, getStringSizeInBytes, formatSize } from '../../utils/sizeLimits';
import { JSON_COMPARE_LEFT_SAMPLE, JSON_COMPARE_RIGHT_SAMPLE } from '../../constants/samples';
import { ComparisonResults } from './comparisonResults';
import { ComparisonInputPanel } from './ComparisonInputPanel';

export const JSONCompare: React.FC = () => {
  const defaultOptions = getDefaultComparisonOptions('json-compare');
  const [input1, setInput1] = useState('');
  const [input2, setInput2] = useState('');
  const [options, setOptions] = useState<ComponentComparisonOptions>(defaultOptions);
  const [result, setResult] = useState<ReturnType<typeof compareJSON> | null>(null);

  const { loadSession } = useSessionStorage({
    componentType: 'json-compare',
    leftInput: input1,
    rightInput: input2,
    comparisonOptions: options,
    autoSaveDelay: 1000,
    enabled: true,
  });

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const session = await loadSession();
        if (session?.leftInput) {
          setInput1(session.leftInput);
        }
        if (session?.rightInput) {
          setInput2(session.rightInput);
        }
        if (session?.comparisonOptions) {
          setOptions(session.comparisonOptions as ComponentComparisonOptions);
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to restore session:', error);
      }
    };

    restoreSession();
  }, [loadSession]);
  const [hasCompared, setHasCompared] = useState(false);
  const [alertError, setAlertError] = useState<{ title: string; message: string } | null>(null);

  const handleFileLoad1 = useCallback((content: string) => {
    setInput1(content);
    if (hasCompared) {
      setResult(null);
      setHasCompared(false);
    }
  }, [hasCompared]);

  const handleFileLoad2 = useCallback((content: string) => {
    setInput2(content);
    if (hasCompared) {
      setResult(null);
      setHasCompared(false);
    }
  }, [hasCompared]);

  const handleUrlLoad1 = useCallback((content: string) => {
    setInput1(content);
    if (hasCompared) {
      setResult(null);
      setHasCompared(false);
    }
  }, [hasCompared]);

  const handleUrlLoad2 = useCallback((content: string) => {
    setInput2(content);
    if (hasCompared) {
      setResult(null);
      setHasCompared(false);
    }
  }, [hasCompared]);

  const handleFormat1 = useCallback((formattedContent: string) => {
    setInput1(formattedContent);
    if (hasCompared) {
      setResult(null);
      setHasCompared(false);
    }
  }, [hasCompared]);

  const handleFormat2 = useCallback((formattedContent: string) => {
    setInput2(formattedContent);
    if (hasCompared) {
      setResult(null);
      setHasCompared(false);
    }
  }, [hasCompared]);

  const handleSampleLoad1 = useCallback(() => {
    setInput1(JSON_COMPARE_LEFT_SAMPLE);
    if (hasCompared) {
      setResult(null);
      setHasCompared(false);
    }
  }, [hasCompared]);

  const handleSampleLoad2 = useCallback(() => {
    setInput2(JSON_COMPARE_RIGHT_SAMPLE);
    if (hasCompared) {
      setResult(null);
      setHasCompared(false);
    }
  }, [hasCompared]);

  const handleFileDrop1 = useCallback((content: string) => {
    handleFileLoad1(content);
  }, [handleFileLoad1]);

  const handleFileDrop2 = useCallback((content: string) => {
    handleFileLoad2(content);
  }, [handleFileLoad2]);

  const handleFileError = useCallback((error: string) => {
    setAlertError({
      title: 'Invalid File',
      message: error,
    });
  }, []);

  const { isDragging: isDragging1, dragHandlers: dragHandlers1 } = useFileDrop({
    onDrop: handleFileDrop1,
    onError: handleFileError,
    acceptTypes: ['.json', 'application/json'],
  });

  const { isDragging: isDragging2, dragHandlers: dragHandlers2 } = useFileDrop({
    onDrop: handleFileDrop2,
    onError: handleFileError,
    acceptTypes: ['.json', 'application/json'],
  });

  const handleInput1Change = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput1(e.target.value);
    // Reset comparison state when input changes
    if (hasCompared) {
      setResult(null);
      setHasCompared(false);
    }
  }, [hasCompared]);

  const handleInput2Change = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput2(e.target.value);
    // Reset comparison state when input changes
    if (hasCompared) {
      setResult(null);
      setHasCompared(false);
    }
  }, [hasCompared]);

  const handlePaste1 = useCallback((e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const pastedText = e.clipboardData.getData('text');
    const newContent = input1 + pastedText;
    
    const validation = validateContentSize(newContent);
    if (!validation.valid) {
      e.preventDefault();
      setAlertError({
        title: 'Content Too Large',
        message: validation.error || 'Content too large. Maximum allowed size is 2 MB.',
      });
      return;
    }
  }, [input1]);

  const handlePaste2 = useCallback((e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const pastedText = e.clipboardData.getData('text');
    const newContent = input2 + pastedText;
    
    const validation = validateContentSize(newContent);
    if (!validation.valid) {
      e.preventDefault();
      setAlertError({
        title: 'Content Too Large',
        message: validation.error || 'Content too large. Maximum allowed size is 2 MB.',
      });
      return;
    }
  }, [input2]);

  const handleCompare = useCallback(() => {
    if (!input1.trim() || !input2.trim()) {
      setResult(null);
      setHasCompared(false);
      return;
    }
    try {
      const jsonOptions: ComparisonOptions = {
        caseSensitive: options.caseSensitive,
        ignoreWhitespace: options.ignoreWhitespace,
        ignoreKeyOrder: options.ignoreKeyOrder || false,
        ignoreArrayOrder: options.ignoreArrayOrder || false,
      };
      const comparisonResult = compareJSON(input1, input2, jsonOptions);
      setResult(comparisonResult);
      setHasCompared(true);
    } catch {
      setResult(null);
      setHasCompared(false);
    }
  }, [input1, input2, options]);

  const handleOptionsChange = useCallback((newOptions: ComponentComparisonOptions) => {
    setOptions(newOptions);
    // Reset comparison state when options change
    if (hasCompared) {
      setResult(null);
      setHasCompared(false);
    }
  }, [hasCompared]);

  const contentSize1 = useMemo(() => {
    const bytes = getStringSizeInBytes(input1);
    return formatSize(bytes);
  }, [input1]);

  const contentSize2 = useMemo(() => {
    const bytes = getStringSizeInBytes(input2);
    return formatSize(bytes);
  }, [input2]);

  // Check if comparison options are satisfied for showing Valid message
  // JSON Compare: Ignore key order ON, Ignore whitespace ON, Case sensitive OFF
  const shouldShowValidMessage = useMemo(() => {
    if (!hasCompared || !result) return false;
    return (
      result.areEqual &&
      !result.hasParseError &&
      options.ignoreKeyOrder === true &&
      options.ignoreWhitespace === true &&
      options.caseSensitive === false
    );
  }, [hasCompared, result, options]);

  return (
    <>
      <Alert
        show={!!alertError}
        title={alertError?.title || ''}
        message={alertError?.message || ''}
        onClose={() => setAlertError(null)}
      />
      <ComparisonInputPanel
        viewType="json-compare"
        acceptTypes={['.json', 'application/json']}
        input1={input1}
        input2={input2}
        onInput1Change={handleInput1Change}
        onInput2Change={handleInput2Change}
        onPaste1={handlePaste1}
        onPaste2={handlePaste2}
        onFileLoad1={handleFileLoad1}
        onFileLoad2={handleFileLoad2}
        onFileError={handleFileError}
        onFormat1={handleFormat1}
        onFormat2={handleFormat2}
        onSampleLoad1={handleSampleLoad1}
        onSampleLoad2={handleSampleLoad2}
        onUrlLoad1={handleUrlLoad1}
        onUrlLoad2={handleUrlLoad2}
        isDragging1={isDragging1}
        isDragging2={isDragging2}
        dragHandlers1={dragHandlers1}
        dragHandlers2={dragHandlers2}
        contentSize1={contentSize1}
        contentSize2={contentSize2}
            options={options}
        onOptionsChange={handleOptionsChange}
            showKeyOrder={true}
            showArrayOrder={true}
        onCompare={handleCompare}
          />

      {hasCompared && result && (
        <ComparisonResults
          result={result}
          hasCompared={hasCompared}
          shouldShowValidMessage={shouldShowValidMessage}
          successMessage="No Differences Found - The JSON objects are identical."
        />
      )}
    </>
  );
};

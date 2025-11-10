import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { validateXML } from '../../utils/xmlValidator';
import { useFileDrop } from '../../hooks/useFileDrop';
import { useSessionStorage } from '../../hooks/useSessionStorage';
import { Alert } from '../Alert';
import { validateContentSize, getStringSizeInBytes, formatSize } from '../../utils/sizeLimits';
import { XML_SAMPLE } from '../../constants/samples';
import { ValidatorInputPanel } from './ValidatorInputPanel';
import { ValidatorResults } from './ValidatorResults';

export const XMLValidator: React.FC = () => {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<ReturnType<typeof validateXML> | null>(null);
  const [hasValidated, setHasValidated] = useState(false);
  const [alertError, setAlertError] = useState<{ title: string; message: string } | null>(null);

  const { loadSession } = useSessionStorage({
    componentType: 'xml-validate',
    input,
    autoSaveDelay: 1000,
    enabled: true,
  });

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const session = await loadSession();
        if (session?.input) {
          setInput(session.input);
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to restore session:', error);
      }
    };

    restoreSession();
  }, [loadSession]);

  const handleFileLoad = useCallback((content: string) => {
    setInput(content);
    // Reset validation state when file is loaded
    setResult(null);
    setHasValidated(false);
  }, []);


  const handleFormat = useCallback((formattedContent: string) => {
    setInput(formattedContent);
    // Reset validation state when content is formatted
    setResult(null);
    setHasValidated(false);
  }, []);

  const handleSampleLoad = useCallback(() => {
    setInput(XML_SAMPLE);
    // Reset validation state when sample is loaded
    setResult(null);
    setHasValidated(false);
  }, []);

  const handleFileDrop = useCallback((content: string) => {
    handleFileLoad(content);
  }, [handleFileLoad]);

  const handleFileError = useCallback((error: string) => {
    setAlertError({
      title: 'Invalid File',
      message: error,
    });
  }, []);

  const { isDragging, dragHandlers } = useFileDrop({
    onDrop: handleFileDrop,
    onError: handleFileError,
    acceptTypes: ['.xml', 'application/xml', 'text/xml'],
  });

  const handleValidate = useCallback(() => {
    if (!input.trim()) {
      setResult(null);
      setHasValidated(false);
      return;
    }
    const validationResult = validateXML(input);
    setResult(validationResult);
    setHasValidated(true);
  }, [input]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    // Reset validation state when input changes
    if (hasValidated) {
      setResult(null);
      setHasValidated(false);
    }
  }, [hasValidated]);

  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const pastedText = e.clipboardData.getData('text');
    const newContent = input + pastedText;
    
    const validation = validateContentSize(newContent);
    if (!validation.valid) {
      e.preventDefault();
      setAlertError({
        title: 'Content Too Large',
        message: validation.error || 'Content too large. Maximum allowed size is 2 MB.',
      });
      return;
    }
  }, [input]);

  const contentSize = useMemo(() => {
    const bytes = getStringSizeInBytes(input);
    return formatSize(bytes);
  }, [input]);

  return (
    <>
        <Alert
          show={!!alertError}
          title={alertError?.title || ''}
          message={alertError?.message || ''}
          onClose={() => setAlertError(null)}
        />
        <ValidatorInputPanel
                viewType="xml-validate"
          acceptTypes={['.xml', 'application/xml', 'text/xml']}
          inputId="xml-input"
          input={input}
          onInputChange={handleInputChange}
          onPaste={handlePaste}
                onFileLoad={handleFileLoad}
          onFileError={handleFileError}
                onFormat={handleFormat}
                onSampleLoad={handleSampleLoad}
          isDragging={isDragging}
          dragHandlers={dragHandlers}
          contentSize={contentSize}
          hasValidated={hasValidated}
          isValid={result?.isValid}
          onValidate={handleValidate}
        />

        <ValidatorResults
          result={result}
          hasValidated={hasValidated}
        />
    </>
  );
};

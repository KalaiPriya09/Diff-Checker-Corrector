import React, { useState, useCallback } from 'react';
import { validateXML } from '../../utils/xmlValidator';
import { useFileDrop } from '../../hooks/useFileDrop';
import { Alert } from '../Alert';
import { InputActions } from '../InputActions';
import { exceedsMaxSize } from '../../utils/sizeLimits';
import {
    InputSection,
    SectionHeader,
    LabelContainer,
    Label,
    StatusBadge,
  TextArea,
  ValidateButton,
  ResultSection,
  ErrorResultSection,
  ResultIcon,
  ResultContent,
  ResultTitle,
  ErrorTitle,
  ResultMessage,
  ErrorMessage,
  ErrorDetails,
  ActionsContainer,
} from './Validator.styles';

export const XMLValidator: React.FC = () => {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<ReturnType<typeof validateXML> | null>(null);
  const [hasValidated, setHasValidated] = useState(false);
  const [alertError, setAlertError] = useState<{ title: string; message: string } | null>(null);

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
    
    if (exceedsMaxSize(newContent)) {
      e.preventDefault();
      setAlertError({
        title: 'Content Too Large',
        message: 'Pasted content exceeds the maximum size of 2 MB. Please paste smaller content.',
      });
      return;
    }
  }, [input]);

  return (
    <>
        <Alert
          show={!!alertError}
          title={alertError?.title || ''}
          message={alertError?.message || ''}
          onClose={() => setAlertError(null)}
        />
        <InputSection>
          <SectionHeader>
            <LabelContainer>
              <Label htmlFor="xml-input">Input Content</Label>
              {hasValidated && result && (
                <StatusBadge isValid={result.isValid}>
                  {result.isValid ? '✓ Valid' : '✗ Invalid'}
                </StatusBadge>
              )}
            </LabelContainer>
            <ActionsContainer>
              <InputActions
                content={input}
                viewType="xml-validate"
                onFileLoad={handleFileLoad}
                onError={handleFileError}
                onFormat={handleFormat}
                acceptTypes={['.xml', 'application/xml', 'text/xml']}
              />
              <ValidateButton onClick={handleValidate}>
                <span>▶</span>
                <span>Validate</span>
              </ValidateButton>
            </ActionsContainer>
          </SectionHeader>
          <div style={{ position: 'relative' }}>
            <TextArea
              id="xml-input"
              value={input}
              onChange={handleInputChange}
              onPaste={handlePaste}
              placeholder="Paste your content here to validate... (or drag and drop a file)"
              {...dragHandlers}
              style={{
                borderColor: isDragging ? '#79589b' : undefined,
                borderWidth: isDragging ? '2px' : undefined,
                backgroundColor: isDragging ? 'rgba(121, 88, 155, 0.1)' : undefined,
              }}
            />
          </div>
        </InputSection>

        {hasValidated && result && (
          <>
            {result.isValid ? (
              <ResultSection>
                <ResultIcon>✓</ResultIcon>
                <ResultContent>
                  <ResultTitle>Validation Successful</ResultTitle>
                  <ResultMessage>Your content is valid and well-formed.</ResultMessage>
                </ResultContent>
              </ResultSection>
            ) : (
              <ErrorResultSection>
                <ResultIcon>✗</ResultIcon>
                <ResultContent>
                  <ErrorTitle>Validation Failed</ErrorTitle>
                  <ErrorMessage>{result.error || 'Invalid XML'}</ErrorMessage>
                  {result.position && (
                    <ErrorDetails>
                      Position: Line {result.position.line}, Column {result.position.column}
                    </ErrorDetails>
                  )}
                </ResultContent>
              </ErrorResultSection>
            )}
          </>
        )}
    </>
  );
};

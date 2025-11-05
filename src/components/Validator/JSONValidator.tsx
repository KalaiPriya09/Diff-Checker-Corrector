import React, { useState, useCallback, useMemo } from 'react';
import { validateJSON } from '../../utils/jsonValidator';
import { useFileDrop } from '../../hooks/useFileDrop';
import { Alert } from '../Alert';
import { InputActions } from '../InputActions';
import { exceedsMaxSize, getStringSizeInBytes, formatSize } from '../../utils/sizeLimits';
import { TextAreaWithLineNumbers } from '../TextAreaWithLineNumbers';
import { Button } from '../button';
import { JSON_SAMPLE } from '../../constants/samples';
import {
    InputSection,
    SectionHeader,
    LabelContainer,
    Label,
    StatusBadge,
    CheckmarkSymbol,
    CrossSymbol,
    TextAreaWrapper,
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
  ContentSize,
} from './Validator.styles';

export const JSONValidator: React.FC = () => {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<ReturnType<typeof validateJSON> | null>(null);
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

  const handleSampleLoad = useCallback(() => {
    setInput(JSON_SAMPLE);
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
    acceptTypes: ['.json', 'application/json'],
  });

  const handleValidate = useCallback(() => {
    if (!input.trim()) {
      setResult(null);
      setHasValidated(false);
      return;
    }
    const validationResult = validateJSON(input);
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
        <InputSection>
          <SectionHeader>
            <LabelContainer>
              <Label htmlFor="json-input">Input Content</Label>
              {hasValidated && result && (
                <StatusBadge isValid={result.isValid}>
                  {result.isValid ? (
                    <>
                      <CheckmarkSymbol>✓</CheckmarkSymbol> Valid
                    </>
                  ) : (
                    <>
                      <CrossSymbol>✗</CrossSymbol> Invalid
                    </>
                  )}
                </StatusBadge>
              )}
            </LabelContainer>
            <ActionsContainer>
              <InputActions
                content={input}
                viewType="json-validate"
                onFileLoad={handleFileLoad}
                onError={handleFileError}
                onFormat={handleFormat}
                onSampleLoad={handleSampleLoad}
                acceptTypes={['.json', 'application/json']}
              />
              <Button onClick={handleValidate} variant="primary">
                <span>▶</span>
                <span>Validate</span>
              </Button>
            </ActionsContainer>
          </SectionHeader>
          <TextAreaWrapper>
            <TextAreaWithLineNumbers
              id="json-input"
              value={input}
              onChange={handleInputChange}
              onPaste={handlePaste}
              placeholder="Paste your content here to validate... (or drag and drop a file)"
              minHeight={400}
              {...dragHandlers}
              style={{
                borderColor: isDragging ? '#79589b' : undefined,
                borderWidth: isDragging ? '2px' : undefined,
                backgroundColor: isDragging ? 'rgba(121, 88, 155, 0.1)' : undefined,
              }}
            />
          </TextAreaWrapper>
          <ContentSize>Size: {contentSize}</ContentSize>
        </InputSection>

        {hasValidated && result && (
          <>
            {result.isValid ? (
              <ResultSection>
                <ResultIcon isError={false}>✓</ResultIcon>
                <ResultContent>
                  <ResultTitle>Validation Successful</ResultTitle>
                  <ResultMessage>Your content is valid and well-formed.</ResultMessage>
                </ResultContent>
              </ResultSection>
            ) : (
              <ErrorResultSection>
                <ResultIcon isError={true}>✗</ResultIcon>
                <ResultContent>
                  <ErrorTitle>Validation Failed</ErrorTitle>
                  <ErrorMessage>{result.error || 'Invalid JSON'}</ErrorMessage>
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

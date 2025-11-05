import React, { useState, useCallback, useMemo } from 'react';
import { compareXML } from '../../utils/xmlCompare';
import { ComparisonOptions } from '../../utils/comparisonOptions';
import { ComparisonOptionsComponent } from '../ComparisonOptions';
import type { ComparisonOptions as ComponentComparisonOptions } from '../ComparisonOptions';
import { useFileDrop } from '../../hooks/useFileDrop';
import { Alert } from '../Alert';
import { InputActions } from '../InputActions';
import { exceedsMaxSize, getStringSizeInBytes, formatSize } from '../../utils/sizeLimits';
import { TextAreaWithLineNumbers } from '../TextAreaWithLineNumbers';
import { Button } from '../button';
import { XML_COMPARE_LEFT_SAMPLE, XML_COMPARE_RIGHT_SAMPLE } from '../../constants/samples';
import {
  TopBar,
  OptionsWrapper,
  InputsContainer,
  InputSection,
  InputLabel,
  ResultSection,
  ResultHeader,
  ResultHeaderRight,
  ResultTitle,
  ChangeBadge,
  ValidBadge,
  CheckmarkSymbol,
  SuccessMessage,
  DifferencesGrid,
  DiffColumn,
  DiffHeader,
  DiffContent,
  DiffLine,
  LineNumber,
  LineContent,
  DiffSummary,
  DiffSummaryItem,
  DiffSummaryLabel,
  DiffSummaryValue,
  StyledErrorBox,
  ContentSize,
} from './Compare.styles';

export const XMLCompare: React.FC = () => {
  const [input1, setInput1] = useState('');
  const [input2, setInput2] = useState('');
  const [options, setOptions] = useState<ComponentComparisonOptions>({
    caseSensitive: true,
    ignoreWhitespace: false,
    ignoreAttributeOrder: false,
  });
  const [result, setResult] = useState<ReturnType<typeof compareXML> | null>(null);
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
    setInput1(XML_COMPARE_LEFT_SAMPLE);
    if (hasCompared) {
      setResult(null);
      setHasCompared(false);
    }
  }, [hasCompared]);

  const handleSampleLoad2 = useCallback(() => {
    setInput2(XML_COMPARE_RIGHT_SAMPLE);
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
    acceptTypes: ['.xml', 'application/xml', 'text/xml'],
  });

  const { isDragging: isDragging2, dragHandlers: dragHandlers2 } = useFileDrop({
    onDrop: handleFileDrop2,
    onError: handleFileError,
    acceptTypes: ['.xml', 'application/xml', 'text/xml'],
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
    
    if (exceedsMaxSize(newContent)) {
      e.preventDefault();
      setAlertError({
        title: 'Content Too Large',
        message: 'Pasted content exceeds the maximum size of 2 MB. Please paste smaller content.',
      });
      return;
    }
  }, [input1]);

  const handlePaste2 = useCallback((e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const pastedText = e.clipboardData.getData('text');
    const newContent = input2 + pastedText;
    
    if (exceedsMaxSize(newContent)) {
      e.preventDefault();
      setAlertError({
        title: 'Content Too Large',
        message: 'Pasted content exceeds the maximum size of 2 MB. Please paste smaller content.',
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
      const xmlOptions: ComparisonOptions = {
        caseSensitive: options.caseSensitive,
        ignoreWhitespace: options.ignoreWhitespace,
        ignoreKeyOrder: options.ignoreAttributeOrder || false, // XML uses this for attribute order
      };
      const comparisonResult = compareXML(input1, input2, xmlOptions);
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
  // XML Compare: Ignore Attribute order ON, Ignore whitespace ON, Case sensitive OFF
  const shouldShowValidMessage = useMemo(() => {
    if (!hasCompared || !result) return false;
    return (
      result.areEqual &&
      !result.hasParseError &&
      options.ignoreAttributeOrder === true &&
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
      <TopBar>
        <OptionsWrapper>
          <ComparisonOptionsComponent
            options={options}
            onChange={handleOptionsChange}
            showAttributeOrder={true}
          />
        </OptionsWrapper>
        <Button onClick={handleCompare} variant="primary">
          <span>↻</span>
          <span>Compare</span>
        </Button>
      </TopBar>

      <InputsContainer>
        <InputSection>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
            <InputLabel htmlFor="xml-input-1">Left</InputLabel>
            <InputActions
              content={input1}
              viewType="xml-compare"
              side="left"
              onFileLoad={handleFileLoad1}
              onError={handleFileError}
              onFormat={handleFormat1}
              onSampleLoad={handleSampleLoad1}
              acceptTypes={['.xml', 'application/xml', 'text/xml']}
            />
          </div>
          <TextAreaWithLineNumbers
            id="xml-input-1"
            value={input1}
            onChange={handleInput1Change}
            onPaste={handlePaste1}
            placeholder="Paste your content here... (or drag and drop a file)"
            minHeight={300}
            {...dragHandlers1}
            style={{
              borderColor: isDragging1 ? '#79589b' : undefined,
              borderWidth: isDragging1 ? '2px' : undefined,
              backgroundColor: isDragging1 ? 'rgba(121, 88, 155, 0.1)' : undefined,
            }}
          />
          <ContentSize>Size: {contentSize1}</ContentSize>
        </InputSection>
        
        <InputSection>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
            <InputLabel htmlFor="xml-input-2">Right</InputLabel>
            <InputActions
              content={input2}
              viewType="xml-compare"
              side="right"
              onFileLoad={handleFileLoad2}
              onError={handleFileError}
              onFormat={handleFormat2}
              onSampleLoad={handleSampleLoad2}
              acceptTypes={['.xml', 'application/xml', 'text/xml']}
            />
          </div>
          <TextAreaWithLineNumbers
            id="xml-input-2"
            value={input2}
            onChange={handleInput2Change}
            onPaste={handlePaste2}
            placeholder="Paste your content here... (or drag and drop a file)"
            minHeight={300}
            {...dragHandlers2}
            style={{
              borderColor: isDragging2 ? '#79589b' : undefined,
              borderWidth: isDragging2 ? '2px' : undefined,
              backgroundColor: isDragging2 ? 'rgba(121, 88, 155, 0.1)' : undefined,
            }}
          />
          <ContentSize>Size: {contentSize2}</ContentSize>
        </InputSection>
      </InputsContainer>

      {hasCompared && result && (
        <ResultSection>
          <ResultHeader>
            <ResultTitle>Comparison Results</ResultTitle>
            <ResultHeaderRight>
              {shouldShowValidMessage && (
                <ValidBadge>
                  <CheckmarkSymbol>✓</CheckmarkSymbol> Valid
                </ValidBadge>
              )}
              {!result.areEqual && !result.hasParseError && (
                <>
                  <ChangeBadge>
                    {result.differencesCount} difference{result.differencesCount !== 1 ? 's' : ''} found
                  </ChangeBadge>
                  <DiffSummary>
                    <DiffSummaryItem>
                      <DiffSummaryLabel>ADDED</DiffSummaryLabel>
                      <DiffSummaryValue type="added">
                        +{result.addedCount ?? 0}
                      </DiffSummaryValue>
                    </DiffSummaryItem>
                    <DiffSummaryItem>
                      <DiffSummaryLabel>REMOVED</DiffSummaryLabel>
                      <DiffSummaryValue type="removed">
                        -{result.removedCount ?? 0}
                      </DiffSummaryValue>
                    </DiffSummaryItem>
                    <DiffSummaryItem>
                      <DiffSummaryLabel>CHANGED</DiffSummaryLabel>
                      <DiffSummaryValue type="modified">
                        ~{result.modifiedCount ?? 0}
                      </DiffSummaryValue>
                    </DiffSummaryItem>
                  </DiffSummary>
                </>
              )}
            </ResultHeaderRight>
          </ResultHeader>
          {result.hasParseError ? (
            <StyledErrorBox>
              <span className="error-icon">✗</span>
              <div className="error-message-content">
                <div className="error-title">Validation Failed</div>
                {result.parseErrorMessage && (
                  <div className="error-detail">{result.parseErrorMessage}</div>
                )}
              </div>
            </StyledErrorBox>
          ) : result.areEqual ? (
            <SuccessMessage>
              <CheckmarkSymbol>✓</CheckmarkSymbol> No Differences Found - The XML documents are identical.
            </SuccessMessage>
          ) : result.diffLines && result.diffLines.length > 0 ? (
            <DifferencesGrid>
              <DiffColumn>
                <DiffHeader>Left</DiffHeader>
                <DiffContent>
                  {result.diffLines
                    .filter(diffLine => {
                      // Only show lines that exist in left and are not blank
                      return diffLine.left !== undefined && (diffLine.left?.trim() || '') !== '';
                    })
                    .map((diffLine, idx) => {
                      let lineType: 'added' | 'removed' | 'modified' | undefined = undefined;
                      if (diffLine.left && !diffLine.right) {
                        lineType = 'removed';
                      } else if (diffLine.left && diffLine.right && diffLine.left !== diffLine.right) {
                        lineType = 'modified';
                      }
                      const displayLineNumber = diffLine.leftLineNumber !== undefined ? diffLine.leftLineNumber : '';
                      return (
                        <DiffLine key={idx} type={lineType}>
                          <LineNumber>{displayLineNumber}</LineNumber>
                          <LineContent type={lineType}>{diffLine.left}</LineContent>
                        </DiffLine>
                      );
                    })}
                </DiffContent>
              </DiffColumn>
              <DiffColumn>
                <DiffHeader>Right</DiffHeader>
                <DiffContent>
                  {result.diffLines
                    .filter(diffLine => {
                      // Only show lines that exist in right and are not blank
                      return diffLine.right !== undefined && (diffLine.right?.trim() || '') !== '';
                    })
                    .map((diffLine, idx) => {
                      let lineType: 'added' | 'removed' | 'modified' | undefined = undefined;
                      if (!diffLine.left && diffLine.right) {
                        lineType = 'added';
                      } else if (diffLine.left && diffLine.right && diffLine.left !== diffLine.right) {
                        lineType = 'modified';
                      }
                      const displayLineNumber = diffLine.rightLineNumber !== undefined ? diffLine.rightLineNumber : '';
                      return (
                        <DiffLine key={idx} type={lineType}>
                          <LineNumber>{displayLineNumber}</LineNumber>
                          <LineContent type={lineType}>{diffLine.right}</LineContent>
                        </DiffLine>
                      );
                    })}
                </DiffContent>
              </DiffColumn>
            </DifferencesGrid>
          ) : (
            <div style={{ padding: '16px', color: '#ef4444' }}>
              Unable to generate diff visualization. Please check your XML syntax.
            </div>
          )}
        </ResultSection>
      )}
    </>
  );
};

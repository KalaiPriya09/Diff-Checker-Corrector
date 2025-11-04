import React, { useState, useCallback } from 'react';
import { compareXML } from '../../utils/xmlCompare';
import { ComparisonOptions } from '../../utils/comparisonOptions';
import { ComparisonOptionsComponent } from '../ComparisonOptions';
import type { ComparisonOptions as ComponentComparisonOptions } from '../ComparisonOptions';
import { useFileDrop } from '../../hooks/useFileDrop';
import { Alert } from '../Alert';
import { InputActions } from '../InputActions';
import { exceedsMaxSize } from '../../utils/sizeLimits';
import {
  TopBar,
  OptionsWrapper,
  CompareButton,
  InputsContainer,
  InputSection,
  InputLabel,
  TextArea,
  ResultSection,
  ResultHeader,
  ResultTitle,
  ChangeBadge,
  SuccessMessage,
  DifferencesGrid,
  DiffColumn,
  DiffHeader,
  DiffContent,
  DiffLine,
  LineNumber,
  LineContent,
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
        <CompareButton onClick={handleCompare}>
          <span>↻</span>
          <span>Compare</span>
        </CompareButton>
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
              acceptTypes={['.xml', 'application/xml', 'text/xml']}
            />
          </div>
          <TextArea
            id="xml-input-1"
            value={input1}
            onChange={handleInput1Change}
            onPaste={handlePaste1}
            placeholder="Paste your content here... (or drag and drop a file)"
            {...dragHandlers1}
            style={{
              borderColor: isDragging1 ? '#79589b' : undefined,
              borderWidth: isDragging1 ? '2px' : undefined,
              backgroundColor: isDragging1 ? 'rgba(121, 88, 155, 0.1)' : undefined,
            }}
          />
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
              acceptTypes={['.xml', 'application/xml', 'text/xml']}
            />
          </div>
          <TextArea
            id="xml-input-2"
            value={input2}
            onChange={handleInput2Change}
            onPaste={handlePaste2}
            placeholder="Paste your content here... (or drag and drop a file)"
            {...dragHandlers2}
            style={{
              borderColor: isDragging2 ? '#79589b' : undefined,
              borderWidth: isDragging2 ? '2px' : undefined,
              backgroundColor: isDragging2 ? 'rgba(121, 88, 155, 0.1)' : undefined,
            }}
          />
        </InputSection>
      </InputsContainer>

      {hasCompared && result && (
        <ResultSection>
          <ResultHeader>
            <ResultTitle>Comparison Results</ResultTitle>
            {!result.areEqual && (
              <ChangeBadge>
                {result.differencesCount} difference{result.differencesCount !== 1 ? 's' : ''} found
              </ChangeBadge>
            )}
          </ResultHeader>
          {result.areEqual ? (
            <SuccessMessage>
              ✓ No Differences Found - The XML documents are identical.
            </SuccessMessage>
          ) : result.diffLines && result.diffLines.length > 0 ? (
            <DifferencesGrid>
              <DiffColumn>
                <DiffHeader>Left</DiffHeader>
                <DiffContent>
                  {result.diffLines.map((diffLine, idx) => {
                    let lineType: 'added' | 'removed' | 'modified' | undefined = undefined;
                    if (diffLine.left && !diffLine.right) {
                      lineType = 'removed';
                    } else if (diffLine.left && diffLine.right && diffLine.left !== diffLine.right) {
                      lineType = 'modified';
                    }
                    return (
                      <DiffLine key={idx} type={lineType}>
                        <LineNumber>{diffLine.lineNumber}</LineNumber>
                        <LineContent type={lineType}>{diffLine.left || ' '}</LineContent>
                      </DiffLine>
                    );
                  })}
                </DiffContent>
              </DiffColumn>
              <DiffColumn>
                <DiffHeader>Right</DiffHeader>
                <DiffContent>
                  {result.diffLines.map((diffLine, idx) => {
                    let lineType: 'added' | 'removed' | 'modified' | undefined = undefined;
                    if (!diffLine.left && diffLine.right) {
                      lineType = 'added';
                    } else if (diffLine.left && diffLine.right && diffLine.left !== diffLine.right) {
                      lineType = 'modified';
                    }
                    return (
                      <DiffLine key={idx} type={lineType}>
                        <LineNumber>{diffLine.lineNumber}</LineNumber>
                        <LineContent type={lineType}>{diffLine.right || ' '}</LineContent>
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

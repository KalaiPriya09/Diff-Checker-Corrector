import React from 'react';
import type { DiffLine, JsonCompareResult, XmlCompareResult, TextCompareResult } from '../../types/common';
import {
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
  DiffLine as StyledDiffLine,
  LineNumber,
  LineContent,
  DiffSummary,
  DiffSummaryItem,
  DiffSummaryLabel,
  DiffSummaryValue,
  StyledErrorBox,
  WordHighlight,
} from './Compare.styles';

type CompareResult = JsonCompareResult | XmlCompareResult | TextCompareResult;

interface ComparisonResultsProps {
  result: CompareResult;
  hasCompared: boolean;
  shouldShowValidMessage?: boolean;
  successMessage?: string;
  compareMode?: 'line' | 'word';
}

export const ComparisonResults: React.FC<ComparisonResultsProps> = ({
  result,
  hasCompared,
  shouldShowValidMessage = false,
  successMessage,
  compareMode = 'line',
}) => {
  if (!hasCompared || !result) {
    return null;
  }

  const hasParseError = 'hasParseError' in result ? result.hasParseError : false;
  const parseErrorMessage = 'parseErrorMessage' in result ? result.parseErrorMessage : undefined;

  // Determine success message based on type
  const getSuccessMessage = () => {
    if (successMessage) return successMessage;
    if ('hasParseError' in result) {
      return 'No Differences Found - The JSON objects are identical.';
    }
    if (result.areEqual) {
      return 'No Differences Found - The text files are identical.';
    }
    return 'No Differences Found - The XML documents are identical.';
  };

  // Render a single diff line
  const renderDiffLine = (
    diffLine: DiffLine,
    side: 'left' | 'right',
    idx: number
  ) => {
    const isLeft = side === 'left';
    const content = isLeft ? diffLine.left : diffLine.right;
    const lineNumber = isLeft ? diffLine.leftLineNumber : diffLine.rightLineNumber;
    const words = isLeft ? diffLine.leftWords : diffLine.rightWords;

    if (content === undefined && (!words || words.length === 0)) return null;

    // Use diffLine.type directly (set correctly by comparison functions)
    // Map to correct highlighting for each side:
    // - 'added': only on right side
    // - 'removed': only on left side  
    // - 'modified': on both sides
    // - 'unchanged': on both sides (no highlighting)
    let lineType: 'added' | 'removed' | 'modified' | undefined = undefined;
    
    if (diffLine.type === 'unchanged') {
      lineType = undefined; // No highlighting
    } else if (diffLine.type === 'added') {
      lineType = isLeft ? undefined : 'added'; // Only show on right
    } else if (diffLine.type === 'removed') {
      lineType = isLeft ? 'removed' : undefined; // Only show on left
    } else if (diffLine.type === 'modified') {
      lineType = 'modified'; // Show on both sides
    }

    // For text compare in word mode, prioritize word highlighting if words exist
    if (compareMode === 'word' && words && words.length > 0) {
      return (
        <StyledDiffLine key={idx} type={undefined}>
          <LineNumber>{lineNumber !== undefined ? lineNumber : ''}</LineNumber>
          <LineContent>
            {words.map((wordDiff, wordIdx) => (
              <React.Fragment key={wordIdx}>
                <WordHighlight type={wordDiff.type}>
                  {wordDiff.word}
                </WordHighlight>
                {wordIdx < words.length - 1 && ' '}
              </React.Fragment>
            ))}
          </LineContent>
        </StyledDiffLine>
      );
    }

    // Standard line rendering (fallback for line mode or when words don't exist)
    const displayLineNumber = lineNumber !== undefined ? lineNumber : '';
    return (
      <StyledDiffLine key={idx} type={lineType}>
        <LineNumber>{displayLineNumber}</LineNumber>
        <LineContent type={lineType}>{content}</LineContent>
      </StyledDiffLine>
    );
  };

  return (
    <ResultSection>
      <ResultHeader>
        <ResultTitle>Comparison Results</ResultTitle>
        <ResultHeaderRight>
          {shouldShowValidMessage && (
            <ValidBadge>
              <CheckmarkSymbol>✓</CheckmarkSymbol> Valid
            </ValidBadge>
          )}
          {!result.areEqual && !hasParseError && (
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

      {hasParseError ? (
        <StyledErrorBox>
          <span className="error-icon">✗</span>
          <div className="error-message-content">
            <div className="error-title">Validation Failed</div>
            {parseErrorMessage && (
              <div className="error-detail">{parseErrorMessage}</div>
            )}
          </div>
        </StyledErrorBox>
      ) : result.areEqual ? (
        <SuccessMessage>
          <CheckmarkSymbol>✓</CheckmarkSymbol> {getSuccessMessage()}
        </SuccessMessage>
      ) : result.diffLines && result.diffLines.length > 0 ? (
        <DifferencesGrid>
          <DiffColumn>
            <DiffHeader>Left</DiffHeader>
            <DiffContent>
              {result.diffLines
                .filter(diffLine => {
                  // Show lines that exist in left (including empty lines)
                  return diffLine.left !== undefined;
                })
                .sort((a, b) => {
                  // Sort by left line number to maintain original order
                  const aNum = a.leftLineNumber ?? 999999;
                  const bNum = b.leftLineNumber ?? 999999;
                  return aNum - bNum;
                })
                .map((diffLine, idx) => renderDiffLine(diffLine, 'left', idx))}
            </DiffContent>
          </DiffColumn>
          <DiffColumn>
            <DiffHeader>Right</DiffHeader>
            <DiffContent>
              {result.diffLines
                .filter(diffLine => {
                  // Show lines that exist in right (including empty lines)
                  return diffLine.right !== undefined;
                })
                .sort((a, b) => {
                  // Sort by right line number to maintain original order
                  const aNum = a.rightLineNumber ?? 999999;
                  const bNum = b.rightLineNumber ?? 999999;
                  return aNum - bNum;
                })
                .map((diffLine, idx) => renderDiffLine(diffLine, 'right', idx))}
            </DiffContent>
          </DiffColumn>
        </DifferencesGrid>
      ) : (
        <div style={{ padding: '16px', color: '#ef4444' }}>
          Unable to generate diff visualization. Please check your syntax.
        </div>
      )}
    </ResultSection>
  );
};


/**
 * Diff Checker Utility
 * 
 * Provides functionality to compare two strings and generate a diff representation.
 * Supports line-by-line comparison with change detection.
 */

import { compareWords, splitIntoWords } from './wordComparison';

export type DiffType = 'added' | 'removed' | 'changed' | 'unchanged';

export interface WordDiff {
  word: string;
  type: DiffType;
}

export interface DiffLine {
  type: DiffType;
  content: string;
  lineNumber: number;
  correspondingLine?: number; // Line number in the other input
  words?: WordDiff[]; // Word-level diff for word mode
}

export interface DiffResult {
  leftLines: DiffLine[];
  rightLines: DiffLine[];
  hasChanges: boolean;
}

export interface DiffOptions {
  ignoreWhitespace?: boolean;
  caseSensitive?: boolean;
  ignoreKeyOrder?: boolean; // For JSON comparison
  ignoreAttributeOrder?: boolean; // For XML comparison
  textCompareMode?: 'line' | 'word'; // For text comparison
}

/**
 * Normalize a line based on diff options
 */
const normalizeLine = (line: string, options: DiffOptions): string => {
  let normalized = line;
  
  if (options.ignoreWhitespace) {
    // Normalize whitespace: handle quoted strings and general whitespace
    // First, normalize whitespace within quoted strings (e.g., " Sample XML " -> "Sample XML")
    normalized = normalized.replace(/"([^"]*)"/g, (match, content) => {
      // Normalize whitespace within the quoted content
      const normalizedContent = content.replace(/\s+/g, ' ').trim();
      return `"${normalizedContent}"`;
    });
    
    // Then collapse all remaining whitespace sequences to single space
    normalized = normalized.replace(/\s+/g, ' ');
    
    // Finally, trim leading/trailing whitespace from the entire line
    normalized = normalized.trim();
  }
  
  if (!options.caseSensitive) {
    normalized = normalized.toLowerCase();
  }
  
  return normalized;
};

/**
 * Recursively sort object keys for comparison
 * Used for JSON key order normalization
 * Exported for use in useDiffChecker hook
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const sortObjectKeys = (obj: any): any => {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(sortObjectKeys);
  }
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sorted: any = {};
  Object.keys(obj)
    .sort()
    .forEach((key) => {
      sorted[key] = sortObjectKeys(obj[key]);
    });
  
  return sorted;
};

/**
 * Performs a simple line-by-line diff between two strings
 * Uses a basic LCS (Longest Common Subsequence) inspired algorithm
 */
export const computeDiff = (
  left: string, 
  right: string, 
  options: DiffOptions = { ignoreWhitespace: false, caseSensitive: true, ignoreKeyOrder: false, ignoreAttributeOrder: false }
): DiffResult => {
  const leftLines = left.split('\n');
  const rightLines = right.split('\n');

  const leftResult: DiffLine[] = [];
  const rightResult: DiffLine[] = [];

  let hasChanges = false;
  let leftIndex = 0;
  let rightIndex = 0;

  // Helper function to compare lines based on options
  const linesMatch = (leftLine: string, rightLine: string): boolean => {
    const normalizedLeft = normalizeLine(leftLine, options);
    const normalizedRight = normalizeLine(rightLine, options);
    return normalizedLeft === normalizedRight;
  };

  // Simple diff algorithm
  while (leftIndex < leftLines.length || rightIndex < rightLines.length) {
    const leftLine = leftLines[leftIndex];
    const rightLine = rightLines[rightIndex];

    if (leftIndex >= leftLines.length) {
      // Only right lines remain - they are added
      rightResult.push({
        type: 'added',
        content: rightLine,
        lineNumber: rightIndex + 1,
      });
      hasChanges = true;
      rightIndex++;
    } else if (rightIndex >= rightLines.length) {
      // Only left lines remain - they are removed
      leftResult.push({
        type: 'removed',
        content: leftLine,
        lineNumber: leftIndex + 1,
      });
      hasChanges = true;
      leftIndex++;
    } else if (linesMatch(leftLine, rightLine)) {
      // Lines are identical
      leftResult.push({
        type: 'unchanged',
        content: leftLine,
        lineNumber: leftIndex + 1,
        correspondingLine: rightIndex + 1,
      });
      rightResult.push({
        type: 'unchanged',
        content: rightLine,
        lineNumber: rightIndex + 1,
        correspondingLine: leftIndex + 1,
      });
      leftIndex++;
      rightIndex++;
    } else {
      // Lines are different - check if next lines match
      const leftNextMatch = rightLines.findIndex((line, idx) => 
        idx > rightIndex && linesMatch(leftLine, line)
      );
      const rightNextMatch = leftLines.findIndex((line, idx) => 
        idx > leftIndex && linesMatch(rightLine, line)
      );

      if (leftNextMatch !== -1 && (rightNextMatch === -1 || leftNextMatch < rightNextMatch)) {
        // Right line was added
        rightResult.push({
          type: 'added',
          content: rightLine,
          lineNumber: rightIndex + 1,
        });
        hasChanges = true;
        rightIndex++;
      } else if (rightNextMatch !== -1) {
        // Left line was removed
        leftResult.push({
          type: 'removed',
          content: leftLine,
          lineNumber: leftIndex + 1,
        });
        hasChanges = true;
        leftIndex++;
      } else {
        // Lines are changed
        leftResult.push({
          type: 'changed',
          content: leftLine,
          lineNumber: leftIndex + 1,
          correspondingLine: rightIndex + 1,
        });
        rightResult.push({
          type: 'changed',
          content: rightLine,
          lineNumber: rightIndex + 1,
          correspondingLine: leftIndex + 1,
        });
        hasChanges = true;
        leftIndex++;
        rightIndex++;
      }
    }
  }

  return {
    leftLines: leftResult,
    rightLines: rightResult,
    hasChanges,
  };
};

/**
 * Alias for computeDiff with simplified options signature
 * Maintains compatibility with code that uses computeLineByLineDiff
 */
export function computeLineByLineDiff(
  leftText: string,
  rightText: string,
  options: {
    ignoreWhitespace?: boolean;
    caseSensitive?: boolean;
    textCompareMode?: 'line' | 'word';
  } = {}
): DiffResult {
  const result = computeDiff(leftText, rightText, {
    ignoreWhitespace: options.ignoreWhitespace || false,
    caseSensitive: options.caseSensitive !== false, // default true
    textCompareMode: options.textCompareMode || 'line',
  });
  
  // If word mode, add word-level diff to each line
  if (options.textCompareMode === 'word') {
    // Process all lines - match by correspondingLine when available
    for (const leftLine of result.leftLines) {
      if (leftLine.type === 'removed') {
        // Only left line exists, all words are removed
        const words = splitIntoWords(leftLine.content, {
          ignoreWhitespace: options.ignoreWhitespace || false,
          caseSensitive: options.caseSensitive !== false,
        });
        leftLine.words = words.map(w => ({ word: w, type: 'removed' as const }));
      } else if (leftLine.correspondingLine !== undefined) {
        // Find the corresponding right line by line number
        const rightLine = result.rightLines.find(r => r.lineNumber === leftLine.correspondingLine);
        if (rightLine && !rightLine.words) {
          // Lines correspond, compute word diff
          const wordDiff = compareWords(leftLine.content, rightLine.content, {
            ignoreWhitespace: options.ignoreWhitespace || false,
            caseSensitive: options.caseSensitive !== false,
          });
          leftLine.words = wordDiff.leftWords;
          rightLine.words = wordDiff.rightWords;
        }
      }
    }
    
    // Process right lines that are added (not matched above)
    for (const rightLine of result.rightLines) {
      if (rightLine.type === 'added' && !rightLine.words) {
        // Only right line exists, all words are added
        const words = splitIntoWords(rightLine.content, {
          ignoreWhitespace: options.ignoreWhitespace || false,
          caseSensitive: options.caseSensitive !== false,
        });
        rightLine.words = words.map(w => ({ word: w, type: 'added' as const }));
      }
    }
  }
  
  return result;
}

// Export DiffLineType as alias for DiffType for compatibility
export type DiffLineType = DiffType;

/**
 * Computes character-level diff for a single line
 * Useful for highlighting specific changes within a line
 */
export const computeLineDiff = (left: string, right: string): { same: boolean; parts: Array<{ value: string; added?: boolean; removed?: boolean }> } => {
  if (left === right) {
    return { same: true, parts: [{ value: left }] };
  }

  // Simple character-level diff
  const parts: Array<{ value: string; added?: boolean; removed?: boolean }> = [];
  let i = 0;
  let j = 0;

  while (i < left.length || j < right.length) {
    if (i < left.length && j < right.length && left[i] === right[j]) {
      // Characters match
      let matchStr = '';
      while (i < left.length && j < right.length && left[i] === right[j]) {
        matchStr += left[i];
        i++;
        j++;
      }
      parts.push({ value: matchStr });
    } else {
      // Characters differ
      let removedStr = '';
      let addedStr = '';
      
      if (i < left.length) {
        removedStr = left[i];
        i++;
      }
      
      if (j < right.length) {
        addedStr = right[j];
        j++;
      }

      if (removedStr) parts.push({ value: removedStr, removed: true });
      if (addedStr) parts.push({ value: addedStr, added: true });
    }
  }

  return { same: false, parts };
};


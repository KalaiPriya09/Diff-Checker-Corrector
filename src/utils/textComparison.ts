// Text comparison utilities

import { validateText } from './textValidation';
import { computeLineByLineDiff, DiffResult } from './diffChecker';
import type { TextCompareMode } from '../types/common';

export interface ComparisonOptions {
  ignoreWhitespace?: boolean;
  caseSensitive?: boolean;
  textCompareMode?: TextCompareMode;
}

/**
 * Compare two text strings
 */
export function compareText(
  leftInput: string,
  rightInput: string,
  options: ComparisonOptions = {}
): {
  leftValidation: ReturnType<typeof validateText>;
  rightValidation: ReturnType<typeof validateText>;
  diff?: DiffResult;
} {
  // Step 1: Validate left text
  const leftValidation = validateText(leftInput);

  // Step 2: Validate right text
  const rightValidation = validateText(rightInput);

  // Step 3: Check if both are valid
  if (!leftValidation.isValid || !rightValidation.isValid) {
    return {
      leftValidation,
      rightValidation,
    };
  }

  // Step 4: Get formatted text
  const leftText = leftValidation.formatted || leftInput;
  const rightText = rightValidation.formatted || rightInput;

  // Step 5: No special normalization for text

  // Step 6 & 7: Compute diff with options
  const diff = computeLineByLineDiff(leftText, rightText, {
    ignoreWhitespace: options.ignoreWhitespace || false,
    caseSensitive: options.caseSensitive !== false, // default true
    textCompareMode: options.textCompareMode || 'line',
  });

  return {
    leftValidation,
    rightValidation,
    diff,
  };
}


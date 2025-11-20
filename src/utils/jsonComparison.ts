// JSON comparison utilities

import { validateJSON, normalizeJSON, normalizeJSONAdvanced, normalizeJSONStringWhitespace } from './jsonValidation';
import { computeLineByLineDiff, DiffResult } from './diffChecker';

export interface ComparisonOptions {
  ignoreKeyOrder?: boolean;
  ignoreArrayOrder?: boolean;
  ignoreWhitespace?: boolean;
  caseSensitive?: boolean;
}

/**
 * Compare two JSON strings
 */
export function compareJSON(
  leftInput: string,
  rightInput: string,
  options: ComparisonOptions = {}
): {
  leftValidation: ReturnType<typeof validateJSON>;
  rightValidation: ReturnType<typeof validateJSON>;
  diff?: DiffResult;
} {
  // Step 1: Validate left JSON
  const leftValidation = validateJSON(leftInput);

  // Step 2: Validate right JSON
  const rightValidation = validateJSON(rightInput);

  // Step 3: Check if both are valid
  if (!leftValidation.isValid || !rightValidation.isValid) {
    return {
      leftValidation,
      rightValidation,
    };
  }

  // Step 4: Get formatted text
  let leftText = leftValidation.formatted || leftInput;
  let rightText = rightValidation.formatted || rightInput;

  // Step 4.5: Normalize whitespace in string values if ignoreWhitespace is enabled
  if (options.ignoreWhitespace) {
    try {
      const leftParsed = JSON.parse(leftText);
      const rightParsed = JSON.parse(rightText);
      const leftNormalized = normalizeJSONStringWhitespace(leftParsed);
      const rightNormalized = normalizeJSONStringWhitespace(rightParsed);
      leftText = JSON.stringify(leftNormalized, null, 2);
      rightText = JSON.stringify(rightNormalized, null, 2);
    } catch {
      // If parsing fails, continue with original text
      // This shouldn't happen since we already validated, but handle gracefully
    }
  }

  // Step 5: Normalization (if ignoreKeyOrder or ignoreArrayOrder is enabled)
  if (options.ignoreKeyOrder || options.ignoreArrayOrder) {
    if (options.ignoreArrayOrder) {
      // Use advanced normalization that sorts both keys and arrays
      // When ignoring array order, we also need to sort keys within array elements
      leftText = normalizeJSONAdvanced(leftText, true);
      rightText = normalizeJSONAdvanced(rightText, true);
    } else if (options.ignoreKeyOrder) {
      // Only sort keys (not arrays)
      leftText = normalizeJSON(leftText);
      rightText = normalizeJSON(rightText);
    }
  }

  // Step 6 & 7: Compute diff with options
  const diff = computeLineByLineDiff(leftText, rightText, {
    ignoreWhitespace: options.ignoreWhitespace || false,
    caseSensitive: options.caseSensitive !== false, // default true
  });

  return {
    leftValidation,
    rightValidation,
    diff,
  };
}


// JSON comparison utilities

import { validateJSON, validateJSONWithoutFormatting, normalizeJSON, normalizeJSONAdvanced, normalizeJSONStringWhitespace } from './jsonValidation';
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
  // Step 1: Validate JSON (use appropriate validation based on ignoreWhitespace)
  // When ignoreWhitespace is false, validate without formatting to preserve structure
  // When ignoreWhitespace is true, use normal validation with formatting
  const leftValidation = options.ignoreWhitespace 
    ? validateJSON(leftInput)
    : validateJSONWithoutFormatting(leftInput);
  const rightValidation = options.ignoreWhitespace
    ? validateJSON(rightInput)
    : validateJSONWithoutFormatting(rightInput);

  // Step 2: Check if both are valid
  if (!leftValidation.isValid || !rightValidation.isValid) {
    return {
      leftValidation,
      rightValidation,
    };
  }

  // Step 3: Get text for comparison
  // When ignoreWhitespace is OFF, use original input to preserve ALL formatting differences
  // When ignoreWhitespace is ON, use formatted version as starting point
  let leftText: string;
  let rightText: string;
  
  if (options.ignoreWhitespace) {
    // When ignoring whitespace, use formatted version as starting point
    leftText = leftValidation.formatted || leftInput;
    rightText = rightValidation.formatted || rightInput;
  } else {
    // When NOT ignoring whitespace, use original input to preserve exact formatting
    // We've already validated it's valid JSON, so we can safely use the original
    leftText = leftInput;
    rightText = rightInput;
  }

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
  // IMPORTANT: Skip normalization when ignoreWhitespace is false to preserve whitespace differences
  // Normalization uses JSON.stringify which formats and loses whitespace information
  if ((options.ignoreKeyOrder || options.ignoreArrayOrder) && options.ignoreWhitespace) {
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


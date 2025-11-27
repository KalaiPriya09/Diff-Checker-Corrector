// XML comparison utilities

import { validateXML, validateXMLWithoutFormatting, normalizeXML, normalizeXMLWhitespace } from './xmlValidation';
import { computeLineByLineDiff, DiffResult } from './diffChecker';

export interface ComparisonOptions {
  ignoreAttributeOrder?: boolean;
  ignoreWhitespace?: boolean;
  caseSensitive?: boolean;
}

/**
 * Compare two XML strings
 */
export function compareXML(
  leftInput: string,
  rightInput: string,
  options: ComparisonOptions = {}
): {
  leftValidation: ReturnType<typeof validateXML>;
  rightValidation: ReturnType<typeof validateXML>;
  diff?: DiffResult;
} {
  // Step 1: Validate XML (use appropriate validation based on ignoreWhitespace)
  // When ignoreWhitespace is false, validate without formatting to preserve structure
  // When ignoreWhitespace is true, use normal validation with formatting
  const leftValidation = options.ignoreWhitespace 
    ? validateXML(leftInput)
    : validateXMLWithoutFormatting(leftInput);
  const rightValidation = options.ignoreWhitespace
    ? validateXML(rightInput)
    : validateXMLWithoutFormatting(rightInput);

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
    // We've already validated it's valid XML, so we can safely use the original
    leftText = leftInput;
    rightText = rightInput;
  }

  // Step 5: Normalize XML whitespace if ignoreWhitespace is enabled
  // This must be done BEFORE attribute normalization to properly handle whitespace
  if (options.ignoreWhitespace) {
    leftText = normalizeXMLWhitespace(leftText);
    rightText = normalizeXMLWhitespace(rightText);
  }

  // Step 6: Normalization (if ignoreAttributeOrder is enabled)
  // IMPORTANT: Skip normalization when ignoreWhitespace is false to preserve whitespace differences
  // Normalization may format and lose whitespace information
  if (options.ignoreAttributeOrder && options.ignoreWhitespace) {
    leftText = normalizeXML(leftText);
    rightText = normalizeXML(rightText);
  }

  // Step 7: Compute diff with options
  // When ignoreWhitespace is false, we need to enable line-by-line whitespace comparison
  // When ignoreWhitespace is true, we've already normalized whitespace at XML level
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


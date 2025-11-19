// XML comparison utilities

import { validateXML, normalizeXML, normalizeXMLWhitespace } from './xmlValidation';
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
  // Step 1: Validate left XML
  const leftValidation = validateXML(leftInput);

  // Step 2: Validate right XML
  const rightValidation = validateXML(rightInput);

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

  // Step 5: Normalize XML whitespace if ignoreWhitespace is enabled
  // This must be done BEFORE attribute normalization to properly handle whitespace
  if (options.ignoreWhitespace) {
    leftText = normalizeXMLWhitespace(leftText);
    rightText = normalizeXMLWhitespace(rightText);
  }

  // Step 6: Normalization (if ignoreAttributeOrder is enabled)
  if (options.ignoreAttributeOrder) {
    leftText = normalizeXML(leftText);
    rightText = normalizeXML(rightText);
  }

  // Step 7: Compute diff with options
  // Note: When ignoreWhitespace is true for XML, we've already normalized whitespace
  // so we can do a direct comparison without line-by-line whitespace normalization
  const diff = computeLineByLineDiff(leftText, rightText, {
    ignoreWhitespace: false, // Already normalized for XML, so no need to normalize again
    caseSensitive: options.caseSensitive !== false, // default true
  });

  return {
    leftValidation,
    rightValidation,
    diff,
  };
}


// XML comparison utilities

import { 
  validateXML, 
  validateXMLWithoutFormatting, 
  normalizeXML, 
  normalizeXMLWhitespace,
  normalizeAttributesOnly,
  normalizeXMLCase
} from './xmlValidation';
import { computeLineByLineDiff, DiffResult } from './diffChecker';

export interface ComparisonOptions {
  ignoreAttributeOrder?: boolean;
  ignoreWhitespace?: boolean;
  caseSensitive?: boolean;
}

/**
 * Compare two XML strings
 * 
 * All comparison options work independently:
 * - ignoreWhitespace: normalizes whitespace in text nodes, removes indentation/newlines
 * - ignoreAttributeOrder: sorts attributes alphabetically (works regardless of ignoreWhitespace)
 * - caseSensitive: when false, converts tags, attributes, and text to lowercase
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
  const { 
    ignoreWhitespace = false, 
    ignoreAttributeOrder = false, 
    caseSensitive = true 
  } = options;

  // Step 1: Validate XML
  // Always validate to ensure XML is well-formed
  const leftValidation = validateXMLWithoutFormatting(leftInput);
  const rightValidation = validateXMLWithoutFormatting(rightInput);

  // If either is invalid, return validation results
  if (!leftValidation.isValid || !rightValidation.isValid) {
    return {
      leftValidation,
      rightValidation,
    };
  }

  // Step 2: Start with validated XML
  // Use the serialized version from validation (minimally formatted)
  let leftText = leftValidation.formatted || leftInput;
  let rightText = rightValidation.formatted || rightInput;

  // Step 3: Apply ignoreWhitespace normalization (INDEPENDENT)
  // This collapses whitespace in text nodes and removes indentation/newlines
  // Must run BEFORE other normalizations to properly handle text content
  if (ignoreWhitespace) {
    leftText = normalizeXMLWhitespace(leftText);
    rightText = normalizeXMLWhitespace(rightText);
  }

  // Step 4: Apply ignoreAttributeOrder normalization (INDEPENDENT)
  // This sorts attributes alphabetically
  // Works regardless of ignoreWhitespace setting
  if (ignoreAttributeOrder) {
    if (ignoreWhitespace) {
      // When ignoreWhitespace is true, use normalizeXML which also formats
      leftText = normalizeXML(leftText);
      rightText = normalizeXML(rightText);
    } else {
      // When ignoreWhitespace is false, use normalizeAttributesOnly to preserve formatting
      leftText = normalizeAttributesOnly(leftText);
      rightText = normalizeAttributesOnly(rightText);
    }
  }

  // Step 5: Apply case normalization (INDEPENDENT)
  // This converts tag names, attribute names, and text to lowercase
  if (!caseSensitive) {
    leftText = normalizeXMLCase(leftText);
    rightText = normalizeXMLCase(rightText);
  }

  // Step 6: Compute diff
  // Pass ignoreWhitespace to handle any remaining whitespace differences at line level
  // (e.g., in attribute values that weren't caught by XML normalization)
  // Pass caseSensitive to handle any remaining case differences at line level
  const diff = computeLineByLineDiff(leftText, rightText, {
    ignoreWhitespace: ignoreWhitespace,
    caseSensitive: caseSensitive,
  });

  return {
    leftValidation,
    rightValidation,
    diff,
  };
}



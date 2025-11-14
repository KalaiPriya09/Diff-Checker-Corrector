import type { XmlValidationResult } from '../types/common';
import {
  isEmptyInput,
  looksLikeXML,
  extractLineFromErrorText,
  extractColumnFromErrorText,
  findErrorLineByIncrementalParsing,
  buildErrorMessage,
} from './validatorFunct';

export type { XmlValidationResult };

/**
 * Extracts line number from XML parser error
 */
function extractXMLErrorPosition(xmlString: string, parserError: Element): { line: number; column: number } | undefined {
  // Try to extract line number from error message
  const errorText = parserError.textContent || '';
  const line = extractLineFromErrorText(errorText);
  
  if (line) {
    const column = extractColumnFromErrorText(errorText) || 1;
    return { line, column };
  }
  
  // Fallback: try to find error by parsing line by line
  const errorLine = findErrorLineByIncrementalParsing(xmlString, (content) => {
    try {
      const parser = new DOMParser();
      const testDoc = parser.parseFromString(content, 'text/xml');
      const testError = testDoc.querySelector('parsererror');
      return !testError;
    } catch {
      return false;
    }
  });
  
  if (errorLine) {
    return { line: errorLine, column: 1 };
  }
  
  return undefined;
}

/**
 * Validates XML string and returns detailed error information
 */
export function validateXML(xmlString: string): XmlValidationResult {
  if (isEmptyInput(xmlString)) {
    return { isValid: false, error: 'Empty input' };
  }

  // Check if input looks like XML
  if (!looksLikeXML(xmlString)) {
    return {
      isValid: false,
      error: 'Input does not appear to be valid XML. Please check your XML syntax.',
    };
  }

  try {
    // Basic XML structure validation
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
    
    // Check for parser errors
    const parserError = xmlDoc.querySelector('parsererror');
    if (parserError) {
      const position = extractXMLErrorPosition(xmlString, parserError);
      
      // Build error message with line number if available
      const baseMessage = 'Invalid XML structure. Please ensure all tags are properly nested and closed.';
      const errorMessage = buildErrorMessage(baseMessage, position);
      
      return {
        isValid: false,
        error: errorMessage,
        position,
      };
    }
    
    return { isValid: true };
  } catch {
    // Return standard error message for invalid XML structure
    return {
      isValid: false,
      error: 'Invalid XML structure. Please ensure all tags are properly nested and closed.',
    };
  }
}

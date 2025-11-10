import type { JsonValidationResult } from '../types/common';
import {
  isEmptyInput,
  looksLikeJSON,
  positionToLineColumn,
  findErrorLineByIncrementalParsing,
  buildErrorMessage,
} from './validatorFunct';

export type { JsonValidationResult };

/**
 * Extracts line and column number from JSON parse error
 */
function extractJSONErrorPosition(jsonString: string, error: Error): { line: number; column: number } | undefined {
  const message = error.message;
  
  // Try to extract position from error message (format: "Unexpected token ... at position X")
  const positionMatch = message.match(/position\s+(\d+)/i);
  if (positionMatch) {
    const position = parseInt(positionMatch[1], 10);
    return positionToLineColumn(jsonString, position);
  }
  
  // Fallback: try to find the line by counting newlines before the error
  const errorLine = findErrorLineByIncrementalParsing(jsonString, (content) => {
    try {
      JSON.parse(content);
      return true;
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
 * Validates JSON string and returns detailed error information
 */
export function validateJSON(jsonString: string): JsonValidationResult {
  if (isEmptyInput(jsonString)) {
    return { isValid: false, error: 'Empty input' };
  }

  // Check if input looks like JSON
  if (!looksLikeJSON(jsonString)) {
    return {
      isValid: false,
      error: 'Input does not appear to be valid JSON. Please check your JSON syntax.',
    };
  }

  try {
    JSON.parse(jsonString);
    return { isValid: true };
  } catch (error) {
    const position = error instanceof Error ? extractJSONErrorPosition(jsonString, error) : undefined;
    
    // Build error message with line number if available
    const baseMessage = 'Invalid JSON syntax. Please check for missing brackets, commas, or quotation marks.';
    const errorMessage = buildErrorMessage(baseMessage, position);
    
    return {
      isValid: false,
      error: errorMessage,
      position,
    };
  }
}

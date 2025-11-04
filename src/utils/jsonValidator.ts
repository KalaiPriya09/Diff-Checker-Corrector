export interface JsonValidationResult {
  isValid: boolean;
  error?: string;
  position?: { line: number; column: number };
}

/**
 * Validates JSON string and returns detailed error information
 */
export function validateJSON(jsonString: string): JsonValidationResult {
  if (!jsonString.trim()) {
    return { isValid: false, error: 'Empty input' };
  }

  try {
    JSON.parse(jsonString);
    return { isValid: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // Extract position information if available
    const positionMatch = errorMessage.match(/position (\d+)/);
    const columnMatch = errorMessage.match(/column (\d+)/);
    
    // Try to parse error message for better user feedback
    let formattedError = errorMessage;
    
    // Common JSON errors
    if (errorMessage.includes('Unexpected token')) {
      if (errorMessage.includes('in JSON')) {
        formattedError = 'Unexpected character or token';
      } else if (errorMessage.includes(',')) {
        formattedError = 'Trailing comma or missing value';
      }
    } else if (errorMessage.includes('Unexpected end')) {
      formattedError = 'Unexpected end of JSON input - missing closing bracket/brace';
    } else if (errorMessage.includes('Expected')) {
      formattedError = 'Missing expected character';
    }
    
    // Try to detect common issues
    const unquotedKeyMatch = jsonString.match(/[{,]\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/);
    if (unquotedKeyMatch && !jsonString.match(/[{,]\s*"[^"]+"\s*:/)) {
      const key = unquotedKeyMatch[1];
      formattedError = `Unquoted key "${key}" - all keys must be quoted in JSON`;
    }
    
    // Check for trailing comma
    if (jsonString.match(/,\s*[}\]]/)) {
      formattedError = 'Trailing comma detected - remove comma before closing bracket/brace';
    }
    
    // Check for invalid string escape
    const invalidEscapeMatch = jsonString.match(/\\[^"\\/bfnrtu]/);
    if (invalidEscapeMatch) {
      formattedError = 'Invalid escape sequence in string';
    }
    
    // Calculate approximate line and column
    let line = 1;
    let column = 1;
    if (positionMatch) {
      const position = parseInt(positionMatch[1], 10);
      const beforeError = jsonString.substring(0, position);
      line = (beforeError.match(/\n/g) || []).length + 1;
      column = beforeError.length - beforeError.lastIndexOf('\n');
    } else if (columnMatch) {
      column = parseInt(columnMatch[1], 10);
    }
    
    return {
      isValid: false,
      error: formattedError,
      position: { line, column },
    };
  }
}

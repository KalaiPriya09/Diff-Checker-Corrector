export interface JsonValidationResult {
  isValid: boolean;
  error?: string;
  position?: { line: number; column: number };
}

/**
 * Checks if a string looks like JSON (not XML or other formats)
 */
function looksLikeJSON(str: string): boolean {
  const trimmed = str.trim();
  // Check if it starts with XML declaration or XML tags
  if (trimmed.startsWith('<?xml') || (trimmed.startsWith('<') && /^<\w+/.test(trimmed))) {
    return false;
  }
  // Check if it starts with JSON-like structure
  return trimmed.startsWith('{') || trimmed.startsWith('[');
}

/**
 * Extracts line and column number from JSON parse error
 */
function extractJSONErrorPosition(jsonString: string, error: Error): { line: number; column: number } | undefined {
  const message = error.message;
  
  // Try to extract position from error message (format: "Unexpected token ... at position X")
  const positionMatch = message.match(/position\s+(\d+)/i);
  if (positionMatch) {
    const position = parseInt(positionMatch[1], 10);
    const lines = jsonString.substring(0, position).split('\n');
    const line = lines.length;
    const column = lines[lines.length - 1].length + 1;
    return { line, column };
  }
  
  // Fallback: try to find the line by counting newlines before the error
  // This is a best-effort approach
  const lines = jsonString.split('\n');
  for (let i = 0; i < lines.length; i++) {
    try {
      JSON.parse(lines.slice(0, i + 1).join('\n'));
    } catch {
      // Found the line with error
      return { line: i + 1, column: 1 };
    }
  }
  
  return undefined;
}

/**
 * Validates JSON string and returns detailed error information
 */
export function validateJSON(jsonString: string): JsonValidationResult {
  if (!jsonString.trim()) {
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
    let errorMessage = 'Invalid JSON syntax. Please check for missing brackets, commas, or quotation marks.';
    if (position) {
      errorMessage = `Invalid JSON syntax at line ${position.line}, column ${position.column}. Please check for missing brackets, commas, or quotation marks.`;
    }
    
    return {
      isValid: false,
      error: errorMessage,
      position,
    };
  }
}

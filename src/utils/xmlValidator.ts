export interface XmlValidationResult {
  isValid: boolean;
  error?: string;
  position?: { line: number; column: number };
}

/**
 * Checks if a string looks like XML
 */
function looksLikeXML(str: string): boolean {
  const trimmed = str.trim();
  // Check if it starts with XML declaration
  if (trimmed.startsWith('<?xml')) {
    return true;
  }
  // Check if it starts with an XML tag
  if (trimmed.startsWith('<') && /^<\w+/.test(trimmed)) {
    return true;
  }
  // Check if it starts with JSON-like structure (not XML)
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    return false;
  }
  // If it has XML-like tags, consider it XML
  return /<\w+[^>]*>/.test(trimmed);
}

/**
 * Extracts line number from XML parser error
 */
function extractXMLErrorPosition(xmlString: string, parserError: Element): { line: number; column: number } | undefined {
  // Try to extract line number from error message
  const errorText = parserError.textContent || '';
  const lineMatch = errorText.match(/line\s+(\d+)/i) || errorText.match(/at line (\d+)/i);
  
  if (lineMatch) {
    const line = parseInt(lineMatch[1], 10);
    const columnMatch = errorText.match(/column\s+(\d+)/i) || errorText.match(/at column (\d+)/i);
    const column = columnMatch ? parseInt(columnMatch[1], 10) : 1;
    return { line, column };
  }
  
  // Fallback: try to find error by parsing line by line
  const lines = xmlString.split('\n');
  for (let i = 0; i < lines.length; i++) {
    try {
      const parser = new DOMParser();
      const testDoc = parser.parseFromString(lines.slice(0, i + 1).join('\n'), 'text/xml');
      const testError = testDoc.querySelector('parsererror');
      if (testError && i === lines.length - 1) {
        // Found the line with error
        return { line: i + 1, column: 1 };
      }
    } catch {
      // Continue searching
    }
  }
  
  return undefined;
}

/**
 * Validates XML string and returns detailed error information
 */
export function validateXML(xmlString: string): XmlValidationResult {
  if (!xmlString.trim()) {
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
      let errorMessage = 'Invalid XML structure. Please ensure all tags are properly nested and closed.';
      if (position) {
        errorMessage = `Invalid XML structure at line ${position.line}, column ${position.column}. Please ensure all tags are properly nested and closed.`;
      }
      
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

/**
 * Common utilities for JSON and XML validation
 */

/**
 * Checks if input is empty
 */
export function isEmptyInput(input: string): boolean {
  return !input.trim();
}

/**
 * Extracts line and column from a character position in a string
 */
export function positionToLineColumn(content: string, position: number): { line: number; column: number } {
  const lines = content.substring(0, position).split('\n');
  const line = lines.length;
  const column = lines[lines.length - 1].length + 1;
  return { line, column };
}

/**
 * Extracts line number from error text using regex patterns
 */
export function extractLineFromErrorText(
  errorText: string,
  patterns: RegExp[] = [/line\s+(\d+)/i, /at line (\d+)/i]
): number | undefined {
  for (const pattern of patterns) {
    const match = errorText.match(pattern);
    if (match) {
      return parseInt(match[1], 10);
    }
  }
  return undefined;
}

/**
 * Extracts column number from error text using regex patterns
 */
export function extractColumnFromErrorText(
  errorText: string,
  patterns: RegExp[] = [/column\s+(\d+)/i, /at column (\d+)/i]
): number | undefined {
  for (const pattern of patterns) {
    const match = errorText.match(pattern);
    if (match) {
      return parseInt(match[1], 10);
    }
  }
  return undefined;
}

/**
 * Builds error message with position information
 */
export function buildErrorMessage(
  baseMessage: string,
  position?: { line: number; column: number }
): string {
  if (position) {
    return `${baseMessage} at line ${position.line}, column ${position.column}.`;
  }
  return baseMessage;
}

/**
 * Finds error line by incremental parsing
 * Generic function that can be used for both JSON and XML
 */
export function findErrorLineByIncrementalParsing(
  content: string,
  parseFn: (content: string) => boolean
): number | undefined {
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    try {
      const isValid = parseFn(lines.slice(0, i + 1).join('\n'));
      if (!isValid && i === lines.length - 1) {
        return i + 1;
      }
    } catch {
      // Found the line with error
      return i + 1;
    }
  }
  return undefined;
}

/**
 * Checks if a string looks like JSON (not XML or other formats)
 */
export function looksLikeJSON(str: string): boolean {
  const trimmed = str.trim();
  // Check if it starts with XML declaration or XML tags
  if (trimmed.startsWith('<?xml') || (trimmed.startsWith('<') && /^<\w+/.test(trimmed))) {
    return false;
  }
  // Check if it starts with JSON-like structure
  return trimmed.startsWith('{') || trimmed.startsWith('[');
}

/**
 * Checks if a string looks like XML
 */
export function looksLikeXML(str: string): boolean {
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


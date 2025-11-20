/**
 * Format Validators
 * 
 * Provides validation and formatting utilities for JSON, XML, and plain text.
 */
import { FormatType } from '../types/common';

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  formatted?: string;
}

/**
 * Validates and formats JSON input
 */
export const validateJSON = (input: string): ValidationResult => {
  if (!input.trim()) {
    return { isValid: false, error: 'Empty input' };
  }

  try {
    const parsed = JSON.parse(input);
    const formatted = JSON.stringify(parsed, null, 2);
    return { isValid: true, formatted };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Invalid JSON';
    return { isValid: false, error: errorMessage };
  }
};

/**
 * Validates and formats XML input
 * Uses DOMParser for validation (browser environment)
 */
export const validateXML = (input: string): ValidationResult => {
  if (!input.trim()) {
    return { isValid: false, error: 'Empty input' };
  }

  try {
    // Check if we're in a browser environment
    if (typeof window === 'undefined' || !window.DOMParser) {
      // In server-side rendering, perform basic XML validation
      return basicXMLValidation(input);
    }

    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(input, 'text/xml');

    // Check for parsing errors
    const parserError = xmlDoc.querySelector('parsererror');
    if (parserError) {
      return {
        isValid: false,
        error: parserError.textContent || 'Invalid XML structure',
      };
    }

    // Format the XML (basic indentation)
    const formatted = formatXML(input);
    return { isValid: true, formatted };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Invalid XML';
    return { isValid: false, error: errorMessage };
  }
};

/**
 * Basic XML validation for server-side rendering
 */
const basicXMLValidation = (input: string): ValidationResult => {
  const openTags: string[] = [];
  const tagRegex = /<\/?([a-zA-Z][\w:-]*)[^>]*>/g;
  let match;

  while ((match = tagRegex.exec(input)) !== null) {
    const fullTag = match[0];
    const tagName = match[1];

    if (fullTag.startsWith('</')) {
      // Closing tag
      if (openTags.length === 0 || openTags[openTags.length - 1] !== tagName) {
        return { isValid: false, error: `Mismatched closing tag: ${tagName}` };
      }
      openTags.pop();
    } else if (!fullTag.endsWith('/>')) {
      // Opening tag (not self-closing)
      openTags.push(tagName);
    }
  }

  if (openTags.length > 0) {
    return { isValid: false, error: `Unclosed tags: ${openTags.join(', ')}` };
  }

  const formatted = formatXML(input);
  return { isValid: true, formatted };
};

/**
 * Formats XML with proper indentation
 */
const formatXML = (xml: string): string => {
  let formatted = '';
  let indent = 0;
  const tab = '  ';

  xml.split(/>\s*</).forEach((node) => {
    if (node.match(/^\/\w/)) indent--; // Closing tag
    formatted += tab.repeat(indent < 0 ? 0 : indent) + '<' + node + '>\n';
    if (node.match(/^<?\w[^>]*[^/]$/)) indent++; // Opening tag
  });

  return formatted.substring(1, formatted.length - 2);
};

/**
 * Validates plain text (always valid, but normalizes line endings)
 */
export const validateText = (input: string): ValidationResult => {
  // Normalize line endings
  const normalized = input.replace(/\r\n/g, '\n');
  return { isValid: true, formatted: normalized };
};

/**
 * Detects the format type of the input string
 */
export const detectFormat = (input: string): FormatType => {
  const trimmed = input.trim();

  // Check for JSON
  if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || 
      (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
    try {
      JSON.parse(trimmed);
      return 'json';
    } catch {
      // Not valid JSON, continue checking
    }
  }

  // Check for XML
  if (trimmed.startsWith('<') && trimmed.endsWith('>')) {
    return 'xml';
  }

  // Default to text
  return 'text';
};

/**
 * Validates input based on the specified format
 */
export const validateFormat = (input: string, format: FormatType): ValidationResult => {
  switch (format) {
    case 'json':
      return validateJSON(input);
    case 'xml':
      return validateXML(input);
    case 'text':
      return validateText(input);
    default:
      return { isValid: false, error: 'Unknown format' };
  }
};


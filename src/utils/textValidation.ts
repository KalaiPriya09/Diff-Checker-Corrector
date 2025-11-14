// Text validation utilities

export interface ValidationResult {
  isValid: boolean;
  formatted?: string;
  error?: string;
}

/**
 * Validate and normalize text (normalize line endings)
 * Text is always valid - no syntax errors
 */
export function validateText(input: string): ValidationResult {
  // Normalize line endings: replace \r\n with \n
  const normalized = input.replace(/\r\n/g, '\n');

  return {
    isValid: true,
    formatted: normalized,
  };
}


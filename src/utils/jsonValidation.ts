// JSON validation utilities

export interface ValidationResult {
  isValid: boolean;
  formatted?: string;
  error?: string;
}

/**
 * Validate and format JSON string
 */
export function validateJSON(input: string): ValidationResult {
  // Check if empty
  if (!input || input.trim() === '') {
    return {
      isValid: false,
      error: 'Input is empty',
    };
  }

  try {
    // Try to parse JSON
    const parsed = JSON.parse(input);

    // Format with indentation
    const formatted = JSON.stringify(parsed, null, 2);

    return {
      isValid: true,
      formatted,
    };
  } catch (error) {
    // Extract error message
    const errorMessage =
      error instanceof Error ? error.message : 'Invalid JSON syntax';

    return {
      isValid: false,
      error: errorMessage,
    };
  }
}

/**
 * Validate JSON without formatting (preserves original structure)
 * Used when we want to preserve exact whitespace differences
 */
export function validateJSONWithoutFormatting(input: string): ValidationResult {
  // Check if empty
  if (!input || input.trim() === '') {
    return {
      isValid: false,
      error: 'Input is empty',
    };
  }

  try {
    // Try to parse JSON to validate it's valid
    JSON.parse(input);

    // Return valid but without formatted version
    // This preserves the original input structure
    return {
      isValid: true,
      // Don't provide formatted version to preserve original formatting
    };
  } catch (error) {
    // Extract error message
    const errorMessage =
      error instanceof Error ? error.message : 'Invalid JSON syntax';

    return {
      isValid: false,
      error: errorMessage,
    };
  }
}

/**
 * Sort object keys alphabetically recursively
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function sortObjectKeys(obj: any): any {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sortObjectKeys(item));
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sorted: any = {};
  const keys = Object.keys(obj).sort();

  for (const key of keys) {
    sorted[key] = sortObjectKeys(obj[key]);
  }

  return sorted;
}

/**
 * Sort array elements recursively
 * For primitive values, sorts them directly
 * For objects, sorts by their stringified representation
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function sortArrayElements(arr: any[]): any[] {
  return arr.map(item => {
    if (Array.isArray(item)) {
      return sortArrayElements(item);
    } else if (item !== null && typeof item === 'object') {
      return sortObjectKeys(item);
    }
    return item;
  }).sort((a, b) => {
    // Convert to string for comparison
    const aStr = JSON.stringify(a);
    const bStr = JSON.stringify(b);
    return aStr.localeCompare(bStr);
  });
}

/**
 * Normalize JSON by sorting keys
 */
export function normalizeJSON(jsonString: string): string {
  try {
    const parsed = JSON.parse(jsonString);
    const sorted = sortObjectKeys(parsed);
    return JSON.stringify(sorted, null, 2);
  } catch {
    return jsonString;
  }
}

/**
 * Normalize JSON by sorting keys and optionally sorting arrays
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function normalizeJSONWithArraySort(obj: any, sortArrays: boolean = false): any {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    if (sortArrays) {
      return sortArrayElements(obj);
    }
    // If not sorting arrays, just recursively process elements
    return obj.map(item => normalizeJSONWithArraySort(item, sortArrays));
  }

  // For objects, sort keys and recursively process values
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sorted: any = {};
  const keys = Object.keys(obj).sort();

  for (const key of keys) {
    sorted[key] = normalizeJSONWithArraySort(obj[key], sortArrays);
  }

  return sorted;
}

/**
 * Normalize JSON by sorting keys and optionally arrays
 */
export function normalizeJSONAdvanced(jsonString: string, sortArrays: boolean = false): string {
  try {
    const parsed = JSON.parse(jsonString);
    const normalized = normalizeJSONWithArraySort(parsed, sortArrays);
    return JSON.stringify(normalized, null, 2);
  } catch {
    return jsonString;
  }
}

/**
 * Normalize whitespace in JSON string values
 * Trims leading/trailing whitespace and collapses multiple spaces to single space
 * Recursively processes all string values in the JSON object
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function normalizeJSONStringWhitespace(obj: any): any {
  if (obj === null || typeof obj === 'undefined') {
    return obj;
  }
  
  if (typeof obj === 'string') {
    // Normalize whitespace: collapse multiple spaces and trim
    return obj.replace(/\s+/g, ' ').trim();
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => normalizeJSONStringWhitespace(item));
  }
  
  if (typeof obj === 'object') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const normalized: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        normalized[key] = normalizeJSONStringWhitespace(obj[key]);
      }
    }
    return normalized;
  }
  
  return obj;
}


import { ComparisonOptions } from './comparisonOptions';
import { DiffLine } from './diffTypes';

export interface JsonDifference {
  type: 'added' | 'removed' | 'modified';
  path: string;
  oldValue?: unknown;
  newValue?: unknown;
  message: string;
}

export type { DiffLine };

export interface JsonCompareResult {
  areEqual: boolean;
  differences: JsonDifference[];
  differencesCount: number;
  diffLines: DiffLine[];
}

/**
 * Recursively sorts object keys alphabetically
 */
function sortKeys(obj: unknown): unknown {
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sortKeys(item));
  }
  
  if (obj && typeof obj === 'object') {
    return Object.keys(obj)
      .sort()
      .reduce((acc, k) => {
        acc[k] = sortKeys((obj as Record<string, unknown>)[k]);
        return acc;
      }, {} as Record<string, unknown>);
  }
  
  return obj;
}

/**
 * Normalizes whitespace in a string (collapses multiple spaces, removes tabs/newlines, trims)
 */
function normalizeWhitespace(str: string): string {
  return str.trim().replace(/[\s\t\n\r]+/g, ' ').trim();
}

/**
 * Canonicalizes a JSON object based on comparison options
 */
function canonicalizeObject(obj: unknown, options: ComparisonOptions): unknown {
  if (obj === null || obj === undefined) {
    return obj;
  }

  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map(item => canonicalizeObject(item, options));
  }

  // Handle primitives (especially strings)
  if (typeof obj !== 'object') {
    if (typeof obj === 'string') {
      let normalized = obj;
      
      // Apply whitespace normalization first
      if (options.ignoreWhitespace) {
        normalized = normalizeWhitespace(normalized);
      }
      
      // Apply case sensitivity
      if (!options.caseSensitive) {
        normalized = normalized.toLowerCase();
      }
      
      return normalized;
    }
    return obj;
  }

  // Handle objects
  const canonical: Record<string, unknown> = {};
  const objRecord = obj as Record<string, unknown>;
  
  // Get keys (they are already sorted if ignoreKeyOrder was true at top level)
  const originalKeys = Object.keys(objRecord);
  
  // Normalize keys for comparison (handle case sensitivity)
  const keyMap = new Map<string, string>();
  const normalizedKeys = new Set<string>();
  const keyOrder: string[] = []; // Preserve order
  
  for (const originalKey of originalKeys) {
    const normalizedKey = options.caseSensitive ? originalKey : originalKey.toLowerCase();
    if (!normalizedKeys.has(normalizedKey)) {
      keyMap.set(normalizedKey, originalKey);
      normalizedKeys.add(normalizedKey);
      keyOrder.push(normalizedKey);
    }
  }
  
  // Keys are already sorted from top-level sortKeys if ignoreKeyOrder is true
  // If ignoreKeyOrder is false, preserve original order
  // Just use the keyOrder array as-is (it's already in the right order)
  
  // Build canonical object
  for (const normalizedKey of keyOrder) {
    const originalKey = keyMap.get(normalizedKey)!;
    const canonicalKey = options.caseSensitive ? originalKey : normalizedKey;
    canonical[canonicalKey] = canonicalizeObject(objRecord[originalKey], options);
  }
  
  return canonical;
}

/**
 * Formats JSON string consistently for display
 */
function formatJsonForDisplay(jsonString: string): string {
  try {
    const parsed = JSON.parse(jsonString);
    return JSON.stringify(parsed, null, 2);
  } catch {
    // If parsing fails, return original with minimal formatting
    return jsonString;
  }
}

/**
 * Compares two JSON strings and returns differences with line-by-line diff
 */
export function compareJSON(
  json1: string,
  json2: string,
  options: ComparisonOptions
): JsonCompareResult {
  try {
    // Step 1: Parse both inputs
    const obj1 = JSON.parse(json1);
    const obj2 = JSON.parse(json2);
    
    // Step 2: Apply Ignore Key Order - sort keys recursively if enabled
    let processed1 = obj1;
    let processed2 = obj2;
    
    if (options.ignoreKeyOrder) {
      processed1 = sortKeys(obj1);
      processed2 = sortKeys(obj2);
    }
    
    // Step 3: Canonicalize both objects (applies case sensitivity and whitespace normalization to values)
    const canonical1 = canonicalizeObject(processed1, options);
    const canonical2 = canonicalizeObject(processed2, options);
    
    // Step 4: Stringify for comparison
    // If ignoreWhitespace is enabled, stringify without indentation (minified)
    // Otherwise, use 2-space indentation for readability
    const comparisonStr1 = JSON.stringify(canonical1, null, options.ignoreWhitespace ? 0 : 2);
    const comparisonStr2 = JSON.stringify(canonical2, null, options.ignoreWhitespace ? 0 : 2);
    
    // Step 5: Apply Ignore Whitespace normalization to entire JSON strings if enabled
    // This handles whitespace in the JSON structure itself (not just in string values)
    let normalizedStr1 = comparisonStr1;
    let normalizedStr2 = comparisonStr2;
    
    if (options.ignoreWhitespace) {
      // For JSON strings, normalize whitespace by removing all formatting whitespace
      // Parse and stringify again with no indentation to remove all whitespace
      try {
        const parsed1 = JSON.parse(comparisonStr1);
        const parsed2 = JSON.parse(comparisonStr2);
        normalizedStr1 = JSON.stringify(parsed1);
        normalizedStr2 = JSON.stringify(parsed2);
      } catch {
        // If re-parsing fails, use original (shouldn't happen)
        normalizedStr1 = comparisonStr1.replace(/\s+/g, ' ');
        normalizedStr2 = comparisonStr2.replace(/\s+/g, ' ');
      }
    }
    
    // Step 6: Format for display (always use 2-space indent for visualization)
    const displayStr1 = JSON.stringify(canonical1, null, 2);
    const displayStr2 = JSON.stringify(canonical2, null, 2);
    
    // Step 7: Generate line-by-line diff on display strings for visualization
    const displayLines1 = displayStr1.split('\n');
    const displayLines2 = displayStr2.split('\n');
    const diffLines = computeLineDiff(displayLines1, displayLines2);
    
    // Step 8: Compute structured differences based on canonicalized objects
    const differences = computeStructuredDifferences(canonical1, canonical2, options);
    
    // Step 9: Check if equal using normalized strings
    const areEqual = normalizedStr1 === normalizedStr2 && differences.length === 0;
    
    return {
      areEqual,
      differences,
      differencesCount: differences.length,
      diffLines,
    };
  } catch (error) {
    // Handle parse errors - still show diff visualization of raw inputs
    const errorMessage = error instanceof Error ? error.message : 'Invalid JSON';
    
    // Format inputs for display (best effort)
    let displayStr1 = json1;
    let displayStr2 = json2;
    
    try {
      displayStr1 = formatJsonForDisplay(json1);
    } catch {
      // Keep original if formatting fails
    }
    
    try {
      displayStr2 = formatJsonForDisplay(json2);
    } catch {
      // Keep original if formatting fails
    }
    
    const displayLines1 = displayStr1.split('\n');
    const displayLines2 = displayStr2.split('\n');
    const diffLines = computeLineDiff(displayLines1, displayLines2);
    
    // Detect if one or both failed to parse
    let parseError1 = false;
    let parseError2 = false;
    
    try {
      JSON.parse(json1);
    } catch {
      parseError1 = true;
    }
    
    try {
      JSON.parse(json2);
    } catch {
      parseError2 = true;
    }
    
    // Create appropriate error message
    let errorMsg = 'JSON Parse Error';
    if (parseError1 && parseError2) {
      errorMsg = 'Both inputs contain invalid JSON';
    } else if (parseError1) {
      errorMsg = 'Left input contains invalid JSON';
    } else if (parseError2) {
      errorMsg = 'Right input contains invalid JSON';
    } else {
      errorMsg = `JSON Parse Error: ${errorMessage}`;
    }
    
    return {
      areEqual: false,
      differences: [{
        type: 'modified',
        path: 'root',
        message: errorMsg,
      }],
      differencesCount: 1,
      diffLines: diffLines.length > 0 ? diffLines : [
        {
          lineNumber: 1,
          left: displayStr1 || ' ',
          right: displayStr2 || ' ',
          type: 'modified',
        }
      ],
    };
  }
}


/**
 * Computes line-by-line diff between two arrays of strings
 */
function computeLineDiff(lines1: string[], lines2: string[]): DiffLine[] {
  const n = lines1.length;
  const m = lines2.length;
  
  // Compute LCS
  const dp: number[][] = Array(n + 1).fill(null).map(() => Array(m + 1).fill(0));
  
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      if (lines1[i - 1] === lines2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }
  
  // Build diff
  let i = n;
  let j = m;
  const diff: DiffLine[] = [];
  
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && lines1[i - 1] === lines2[j - 1]) {
      diff.unshift({
        lineNumber: i,
        left: lines1[i - 1],
        right: lines2[j - 1],
        type: 'unchanged',
      });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      diff.unshift({
        lineNumber: j,
        right: lines2[j - 1],
        type: 'added',
      });
      j--;
    } else if (i > 0) {
      diff.unshift({
        lineNumber: i,
        left: lines1[i - 1],
        type: 'removed',
      });
      i--;
    }
  }
  
  return diff;
}

/**
 * Computes structured differences between two objects
 */
function computeStructuredDifferences(
  obj1: unknown,
  obj2: unknown,
  options: ComparisonOptions,
  path: string = ''
): JsonDifference[] {
  const differences: JsonDifference[] = [];
  
  // Handle null/undefined
  if (obj1 === null || obj1 === undefined) {
    if (obj2 !== null && obj2 !== undefined) {
      differences.push({
        type: 'added',
        path: path || 'root',
        newValue: obj2,
        message: `Added: ${path || 'root'}`,
      });
    }
    return differences;
  }
  
  if (obj2 === null || obj2 === undefined) {
    differences.push({
      type: 'removed',
      path: path || 'root',
      oldValue: obj1,
      message: `Removed: ${path || 'root'}`,
    });
    return differences;
  }
  
  // Compare types
  if (typeof obj1 !== typeof obj2) {
    differences.push({
      type: 'modified',
      path: path || 'root',
      oldValue: obj1,
      newValue: obj2,
      message: `Type changed: ${typeof obj1} → ${typeof obj2}`,
    });
    return differences;
  }
  
  // Compare primitives
  if (typeof obj1 !== 'object' || obj1 === null) {
    if (obj1 !== obj2) {
      differences.push({
        type: 'modified',
        path: path || 'root',
        oldValue: obj1,
        newValue: obj2,
        message: `Value changed: ${JSON.stringify(obj1)} → ${JSON.stringify(obj2)}`,
      });
    }
    return differences;
  }
  
  // Compare arrays
  if (Array.isArray(obj1) || Array.isArray(obj2)) {
    if (!Array.isArray(obj1) || !Array.isArray(obj2)) {
      differences.push({
        type: 'modified',
        path: path || 'root',
        oldValue: obj1,
        newValue: obj2,
        message: `Type mismatch: array vs non-array`,
      });
      return differences;
    }
    
    const maxLength = Math.max(obj1.length, obj2.length);
    for (let i = 0; i < maxLength; i++) {
      const itemPath = path ? `${path}[${i}]` : `[${i}]`;
      if (i >= obj1.length) {
        differences.push({
          type: 'added',
          path: itemPath,
          newValue: obj2[i],
          message: `Added at ${itemPath}`,
        });
      } else if (i >= obj2.length) {
        differences.push({
          type: 'removed',
          path: itemPath,
          oldValue: obj1[i],
          message: `Removed from ${itemPath}`,
        });
      } else {
        differences.push(...computeStructuredDifferences(obj1[i], obj2[i], options, itemPath));
      }
    }
    return differences;
  }
  
  // Compare objects
  const obj1Record = obj1 as Record<string, unknown>;
  const obj2Record = obj2 as Record<string, unknown>;
  const allKeys = new Set([...Object.keys(obj1Record), ...Object.keys(obj2Record)]);
  const sortedKeys = options.ignoreKeyOrder 
    ? Array.from(allKeys).sort() 
    : Array.from(allKeys);
  
  for (const key of sortedKeys) {
    const keyPath = path ? `${path}.${key}` : key;
    
    if (!(key in obj1Record)) {
      differences.push({
        type: 'added',
        path: keyPath,
        newValue: obj2Record[key],
        message: `Added key: ${keyPath}`,
      });
    } else if (!(key in obj2Record)) {
      differences.push({
        type: 'removed',
        path: keyPath,
        oldValue: obj1Record[key],
        message: `Removed key: ${keyPath}`,
      });
    } else {
      differences.push(...computeStructuredDifferences(obj1Record[key], obj2Record[key], options, keyPath));
    }
  }
  
  return differences;
}

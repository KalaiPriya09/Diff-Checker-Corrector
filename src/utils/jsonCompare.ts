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
  addedCount?: number;
  removedCount?: number;
  modifiedCount?: number;
  hasParseError?: boolean;
  parseErrorMessage?: string;
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
/**
 * Checks if a string looks like JSON (not XML or other formats)
 */
function looksLikeJSON(str: string): boolean {
  const trimmed = str.trim();
  // Check if it starts with XML declaration or XML tags
  if (trimmed.startsWith('<?xml') || trimmed.startsWith('<') && /^<\w+/.test(trimmed)) {
    return false;
  }
  // Check if it starts with JSON-like structure
  return trimmed.startsWith('{') || trimmed.startsWith('[');
}

export function compareJSON(
  json1: string,
  json2: string,
  options: ComparisonOptions
): JsonCompareResult {
  // Check if inputs look like JSON
  if (!looksLikeJSON(json1) || !looksLikeJSON(json2)) {
    const errorMsg = 'Input does not appear to be valid JSON. Please check your JSON syntax.';
    return {
      areEqual: false,
      differences: [{
        type: 'modified',
        path: 'root',
        message: errorMsg,
      }],
      differencesCount: 1,
      diffLines: [],
      addedCount: 0,
      removedCount: 0,
      modifiedCount: 0,
      hasParseError: true,
      parseErrorMessage: errorMsg,
    };
  }
  
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
    
    // Step 7: Generate semantic diff based on key-value pairs
    const displayLines1 = displayStr1.split('\n');
    const displayLines2 = displayStr2.split('\n');
    // First compute structured differences to know which keys are added/removed/changed
    const differences = computeStructuredDifferences(canonical1, canonical2, options);
    const diffLines = computeSemanticJSONDiff(displayLines1, displayLines2, differences, options);
    
    // Step 9: Check if equal using normalized strings
    const areEqual = normalizedStr1 === normalizedStr2 && differences.length === 0;
    
    // Count actual differences from diffLines
    const addedCount = diffLines.filter(d => d.type === 'added').length;
    const removedCount = diffLines.filter(d => d.type === 'removed').length;
    const modifiedCount = diffLines.filter(d => d.type === 'modified').length;
    const totalDifferences = addedCount + removedCount + modifiedCount;
    
    return {
      areEqual,
      differences,
      differencesCount: totalDifferences > 0 ? totalDifferences : differences.length,
      diffLines,
      addedCount,
      removedCount,
      modifiedCount,
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
    
    // Detect if one or both failed to parse and extract line numbers
    let parseError1 = false;
    let parseError2 = false;
    let errorLine1: number | undefined;
    let errorLine2: number | undefined;
    
    try {
      JSON.parse(json1);
    } catch (err) {
      parseError1 = true;
      if (err instanceof Error) {
        const positionMatch = err.message.match(/position\s+(\d+)/i);
        if (positionMatch) {
          const position = parseInt(positionMatch[1], 10);
          const lines = json1.substring(0, position).split('\n');
          errorLine1 = lines.length;
        } else {
          // Fallback: find first problematic line
          const lines = json1.split('\n');
          for (let i = 0; i < lines.length; i++) {
            try {
              JSON.parse(lines.slice(0, i + 1).join('\n'));
            } catch {
              errorLine1 = i + 1;
              break;
            }
          }
        }
      }
    }
    
    try {
      JSON.parse(json2);
    } catch (err) {
      parseError2 = true;
      if (err instanceof Error) {
        const positionMatch = err.message.match(/position\s+(\d+)/i);
        if (positionMatch) {
          const position = parseInt(positionMatch[1], 10);
          const lines = json2.substring(0, position).split('\n');
          errorLine2 = lines.length;
        } else {
          // Fallback: find first problematic line
          const lines = json2.split('\n');
          for (let i = 0; i < lines.length; i++) {
            try {
              JSON.parse(lines.slice(0, i + 1).join('\n'));
            } catch {
              errorLine2 = i + 1;
              break;
            }
          }
        }
      }
    }
    
    // Create appropriate error message based on which side has the error
    let errorMsg = 'JSON Parse Error';
    if (parseError1 && parseError2) {
      const leftMsg = errorLine1 ? ` at line ${errorLine1}` : '';
      const rightMsg = errorLine2 ? ` at line ${errorLine2}` : '';
      errorMsg = `Left JSON is not valid${leftMsg}. Right JSON is not valid${rightMsg}. Please fix syntax errors before comparing.`;
    } else if (parseError1) {
      const lineMsg = errorLine1 ? ` at line ${errorLine1}` : '';
      errorMsg = `Left JSON is not valid${lineMsg}. Please fix syntax errors before comparing.`;
    } else if (parseError2) {
      const lineMsg = errorLine2 ? ` at line ${errorLine2}` : '';
      errorMsg = `Right JSON is not valid${lineMsg}. Please fix syntax errors before comparing.`;
    } else {
      errorMsg = `JSON Parse Error: ${errorMessage}`;
    }
    
    const finalDiffLines = diffLines.length > 0 ? diffLines : [
      {
        lineNumber: 1,
        leftLineNumber: 1,
        rightLineNumber: 1,
        left: displayStr1 || ' ',
        right: displayStr2 || ' ',
        type: 'modified' as const,
      }
    ];
    
    // Recalculate counts for final diffLines
    const finalAddedCount = finalDiffLines.filter(d => d.type === 'added').length;
    const finalRemovedCount = finalDiffLines.filter(d => d.type === 'removed').length;
    const finalModifiedCount = finalDiffLines.filter(d => d.type === 'modified').length;
    const finalTotalDifferences = finalAddedCount + finalRemovedCount + finalModifiedCount;
    
    return {
      areEqual: false,
      differences: [{
        type: 'modified',
        path: 'root',
        message: errorMsg,
      }],
      differencesCount: finalTotalDifferences > 0 ? finalTotalDifferences : 1,
      diffLines: finalDiffLines,
      addedCount: finalAddedCount,
      removedCount: finalRemovedCount,
      modifiedCount: finalModifiedCount,
      hasParseError: true,
      parseErrorMessage: errorMsg,
    };
  }
}


/**
 * Extracts key name from a JSON line (e.g., '  "name": "John",' -> 'name')
 */
function extractKeyFromJSONLine(line: string): string | null {
  const trimmed = line.trim();
  // Match: "key": or 'key': 
  const keyMatch = trimmed.match(/^["']([^"':\s]+)["']\s*:/);
  if (keyMatch) {
    return keyMatch[1];
  }
  return null;
}

/**
 * Gets the top-level key from a path (e.g., 'address.city' -> 'address')
 */
function getTopLevelKey(path: string): string {
  const parts = path.split('.');
  return parts[0];
}

/**
 * Computes semantic diff based on key-value pairs for JSON
 * Uses structured differences to correctly identify added/removed/changed keys
 */
function computeSemanticJSONDiff(
  lines1: string[],
  lines2: string[],
  differences: JsonDifference[],
  options: ComparisonOptions
): DiffLine[] {
  // Create map of key -> diff type for top-level keys
  const keyDiffType = new Map<string, 'added' | 'removed' | 'modified'>();
  
  differences.forEach(diff => {
    const topKey = getTopLevelKey(diff.path);
    const normalizedKey = options.caseSensitive ? topKey : topKey.toLowerCase();
    // Only set if not already set, or if current is more important (modified > added/removed)
    if (!keyDiffType.has(normalizedKey) || diff.type === 'modified') {
      keyDiffType.set(normalizedKey, diff.type);
    }
  });
  
  // Create key-to-line mapping for both sides
  const keyToLine1 = new Map<string, { line: string; lineNum: number }>();
  const keyToLine2 = new Map<string, { line: string; lineNum: number }>();
  
  lines1.forEach((line, idx) => {
    const key = extractKeyFromJSONLine(line);
    if (key) {
      const normalizedKey = options.caseSensitive ? key : key.toLowerCase();
      keyToLine1.set(normalizedKey, { line, lineNum: idx + 1 });
    }
  });
  
  lines2.forEach((line, idx) => {
    const key = extractKeyFromJSONLine(line);
    if (key) {
      const normalizedKey = options.caseSensitive ? key : key.toLowerCase();
      keyToLine2.set(normalizedKey, { line, lineNum: idx + 1 });
    }
  });
  
  // Build diff by processing lines in order, matching keys semantically
  const result: DiffLine[] = [];
  const processedLeft = new Set<number>();
  const processedRight = new Set<number>();
  let lineNumber = 1;
  
  // Helper to check if line is an array item
  const isArrayItem = (line: string): boolean => {
    const trimmed = line.trim();
    return trimmed.startsWith('"') || trimmed.startsWith("'") || /^[-\d]/.test(trimmed);
  };
  
  // Process all lines from left, matching with right by key
  for (let i = 0; i < lines1.length; i++) {
    if (processedLeft.has(i + 1)) continue;
    
    const line1 = lines1[i];
    const key1 = extractKeyFromJSONLine(line1);
    
    if (key1) {
      const normalizedKey1 = options.caseSensitive ? key1 : key1.toLowerCase();
      const rightLine = keyToLine2.get(normalizedKey1);
      
      if (rightLine && !processedRight.has(rightLine.lineNum)) {
        // Key exists in both - check if values differ
        if (line1 === rightLine.line) {
          // Same key, same value - Unchanged
          result.push({
            lineNumber: lineNumber++,
            leftLineNumber: i + 1,
            rightLineNumber: rightLine.lineNum,
            left: line1,
            right: rightLine.line,
            type: 'unchanged',
          });
        } else {
          // Same key, different value - Modified (yellow)
          result.push({
            lineNumber: lineNumber++,
            leftLineNumber: i + 1,
            rightLineNumber: rightLine.lineNum,
            left: line1,
            right: rightLine.line,
            type: 'modified',
          });
        }
        processedLeft.add(i + 1);
        processedRight.add(rightLine.lineNum);
      } else {
        // Key only in left - Removed (red)
        result.push({
          lineNumber: lineNumber++,
          leftLineNumber: i + 1,
          rightLineNumber: undefined,
          left: line1,
          right: undefined,
          type: 'removed',
        });
        processedLeft.add(i + 1);
      }
    } else if (isArrayItem(line1)) {
      // Array item - try to find matching value in right
      const matchingIdx = lines2.findIndex((l, idx) => {
        if (processedRight.has(idx + 1)) return false;
        if (!isArrayItem(l)) return false;
        // Match by value (normalize for comparison)
        const leftVal = line1.trim().replace(/[",[\]]/g, '').trim();
        const rightVal = l.trim().replace(/[",[\]]/g, '').trim();
        return leftVal === rightVal;
      });
      
      if (matchingIdx >= 0) {
        // Found matching array item
        result.push({
          lineNumber: lineNumber++,
          leftLineNumber: i + 1,
          rightLineNumber: matchingIdx + 1,
          left: line1,
          right: lines2[matchingIdx],
          type: 'unchanged',
        });
        processedLeft.add(i + 1);
        processedRight.add(matchingIdx + 1);
      } else {
        // Array item only in left - Removed (red)
        result.push({
          lineNumber: lineNumber++,
          leftLineNumber: i + 1,
          rightLineNumber: undefined,
          left: line1,
          right: undefined,
          type: 'removed',
        });
        processedLeft.add(i + 1);
      }
    } else {
      // Structural line (no key) - try to match with right
      const matchingIdx = lines2.findIndex((l, idx) => l === line1 && !processedRight.has(idx + 1));
      if (matchingIdx >= 0) {
        result.push({
          lineNumber: lineNumber++,
          leftLineNumber: i + 1,
          rightLineNumber: matchingIdx + 1,
          left: line1,
          right: lines2[matchingIdx],
          type: 'unchanged',
        });
        processedLeft.add(i + 1);
        processedRight.add(matchingIdx + 1);
      } else {
        result.push({
          lineNumber: lineNumber++,
          leftLineNumber: i + 1,
          rightLineNumber: undefined,
          left: line1,
          right: undefined,
          type: 'unchanged',
        });
        processedLeft.add(i + 1);
      }
    }
  }
  
  // Process remaining lines from right (added keys and array items)
  for (let j = 0; j < lines2.length; j++) {
    if (processedRight.has(j + 1)) continue;
    
    const line2 = lines2[j];
    const key2 = extractKeyFromJSONLine(line2);
    
    if (key2) {
      const normalizedKey2 = options.caseSensitive ? key2 : key2.toLowerCase();
      const leftLine = keyToLine1.get(normalizedKey2);
      
      if (!leftLine) {
        // Key only in right - Added (green)
        result.push({
          lineNumber: lineNumber++,
          leftLineNumber: undefined,
          rightLineNumber: j + 1,
          left: undefined,
          right: line2,
          type: 'added',
        });
        processedRight.add(j + 1);
      }
    } else if (isArrayItem(line2)) {
      // Array item only in right - Added (green)
      result.push({
        lineNumber: lineNumber++,
        leftLineNumber: undefined,
        rightLineNumber: j + 1,
        left: undefined,
        right: line2,
        type: 'added',
      });
      processedRight.add(j + 1);
    } else {
      // Structural line from right
      result.push({
        lineNumber: lineNumber++,
        leftLineNumber: undefined,
        rightLineNumber: j + 1,
        left: undefined,
        right: line2,
        type: 'unchanged',
      });
      processedRight.add(j + 1);
    }
  }
  
  // Sort by line numbers to maintain original order
  result.sort((a, b) => {
    const leftA = a.leftLineNumber ?? 999999;
    const leftB = b.leftLineNumber ?? 999999;
    const rightA = a.rightLineNumber ?? 999999;
    const rightB = b.rightLineNumber ?? 999999;
    return Math.min(leftA, rightA) - Math.min(leftB, rightB);
  });
  
  return result;
}

/**
 * Computes line-by-line diff using LCS algorithm
 * Preserves original line numbers while correctly identifying adds/removes/modifications
 */
function computeLineDiff(lines1: string[], lines2: string[]): DiffLine[] {
  const n = lines1.length;
  const m = lines2.length;
  
  // Compute LCS matrix
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
  
  // Build diff by backtracking
  const diff: DiffLine[] = [];
  let i = n;
  let j = m;
  let diffLineNumber = 1;
  
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && lines1[i - 1] === lines2[j - 1]) {
      // Lines match - both move back
      diff.unshift({
        lineNumber: diffLineNumber++,
        leftLineNumber: i,
        rightLineNumber: j,
        left: lines1[i - 1],
        right: lines2[j - 1],
        type: 'unchanged',
      });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      // Line added on right
      diff.unshift({
        lineNumber: diffLineNumber++,
        leftLineNumber: undefined,
        rightLineNumber: j,
        left: undefined,
        right: lines2[j - 1],
        type: 'added',
      });
      j--;
    } else if (i > 0) {
      // Line removed from left
      diff.unshift({
        lineNumber: diffLineNumber++,
        leftLineNumber: i,
        rightLineNumber: undefined,
        left: lines1[i - 1],
        right: undefined,
        type: 'removed',
      });
      i--;
    }
  }
  
  // Check for modifications: if consecutive removed+added pairs are at similar positions, mark as modified
  const result: DiffLine[] = [];
  for (let k = 0; k < diff.length; k++) {
    const current = diff[k];
    const next = diff[k + 1];
    
    // Check if current is removed and next is added
    if (current.type === 'removed' && next && next.type === 'added') {
      const leftPos = current.leftLineNumber ?? 0;
      const rightPos = next.rightLineNumber ?? 0;
      
      // If positions are close (within 2 lines), treat as modification
      if (Math.abs(leftPos - rightPos) <= 2) {
        result.push({
          lineNumber: current.lineNumber,
          leftLineNumber: current.leftLineNumber,
          rightLineNumber: next.rightLineNumber,
          left: current.left,
          right: next.right,
          type: 'modified',
        });
        k++; // Skip next
      } else {
        result.push(current);
      }
    } else {
      result.push(current);
    }
  }
  
  return result;
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

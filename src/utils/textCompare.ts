import { ComparisonOptions } from './comparisonOptions';
import { DiffLine } from './diffTypes';

export interface TextDifference {
  type: 'added' | 'removed' | 'unchanged';
  line: number;
  content: string;
}

export type { DiffLine };

export interface TextCompareResult {
  areEqual: boolean;
  differences: TextDifference[];
  totalChanges: number;
  differencesCount: number;
  diffLines: DiffLine[];
}

/**
 * Normalizes a line based on comparison options
 */
function normalizeLine(line: string, options: ComparisonOptions): string {
  let normalized = line;
  
  // Apply whitespace normalization
  if (options.ignoreWhitespace) {
    normalized = normalized.trim().replace(/\s+/g, ' ');
  }
  
  // Apply case sensitivity
  if (!options.caseSensitive) {
    normalized = normalized.toLowerCase();
  }
  
  return normalized;
}

/**
 * Compares two text strings line by line with options
 */
export function compareText(
  text1: string,
  text2: string,
  options: ComparisonOptions
): TextCompareResult {
  // Split into lines
  const lines1 = text1.split(/\r?\n/);
  const lines2 = text2.split(/\r?\n/);
  
  // Normalize lines for comparison
  const normalized1 = lines1.map(line => normalizeLine(line, options));
  const normalized2 = lines2.map(line => normalizeLine(line, options));
  
  // Compute line-by-line diff using LCS
  const diffLines = computeLineDiff(lines1, lines2, normalized1, normalized2);
  
  // Build differences array
  const differences: TextDifference[] = diffLines.map(diff => {
    if (diff.type === 'unchanged') {
      return {
        type: 'unchanged',
        line: diff.lineNumber,
        content: diff.left || diff.right || '',
      };
    } else if (diff.type === 'added') {
      return {
        type: 'added',
        line: diff.lineNumber,
        content: diff.right || '',
      };
    } else if (diff.type === 'removed') {
      return {
        type: 'removed',
        line: diff.lineNumber,
        content: diff.left || '',
      };
    } else {
      // Modified - treat as removed + added
      return {
        type: 'removed',
        line: diff.lineNumber,
        content: diff.left || '',
      };
    }
  });
  
  // Add added lines for modified entries
  diffLines.forEach(diff => {
    if (diff.type === 'modified') {
      differences.push({
        type: 'added',
        line: diff.lineNumber,
        content: diff.right || '',
      });
    }
  });
  
  const totalChanges = differences.filter(d => d.type === 'added' || d.type === 'removed').length;
  
  return {
    areEqual: totalChanges === 0,
    differences,
    totalChanges,
    differencesCount: totalChanges,
    diffLines,
  };
}

/**
 * Computes line-by-line diff using LCS algorithm
 */
function computeLineDiff(
  lines1: string[],
  lines2: string[],
  normalized1: string[],
  normalized2: string[]
): DiffLine[] {
  const n = normalized1.length;
  const m = normalized2.length;
  
  // Compute LCS matrix
  const dp: number[][] = Array(n + 1).fill(null).map(() => Array(m + 1).fill(0));
  
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      if (normalized1[i - 1] === normalized2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }
  
  // Build diff
  const diff: DiffLine[] = [];
  let i = n;
  let j = m;
  let lineCounter = 1;
  
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && normalized1[i - 1] === normalized2[j - 1]) {
      // Lines match
      diff.unshift({
        lineNumber: lineCounter++,
        left: lines1[i - 1],
        right: lines2[j - 1],
        type: 'unchanged',
      });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      // Line added
      diff.unshift({
        lineNumber: lineCounter++,
        right: lines2[j - 1],
        type: 'added',
      });
      j--;
    } else if (i > 0) {
      // Line removed
      diff.unshift({
        lineNumber: lineCounter++,
        left: lines1[i - 1],
        type: 'removed',
      });
      i--;
    }
  }
  
  // Merge consecutive removed+added pairs as modified
  const merged: DiffLine[] = [];
  for (let k = 0; k < diff.length; k++) {
    const current = diff[k];
    const next = diff[k + 1];
    
    if (current.type === 'removed' && next && next.type === 'added') {
      merged.push({
        lineNumber: current.lineNumber,
        left: current.left,
        right: next.right,
        type: 'modified',
      });
      k++; // Skip next
    } else {
      merged.push(current);
    }
  }
  
  return merged;
}

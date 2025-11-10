import type { ComparisonOptions, TextDifference, TextCompareResult, DiffLine, WordDiff } from '../types/common';

export type { DiffLine };

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
 * Splits a line into words
 */
function splitIntoWords(line: string, options: ComparisonOptions): string[] {
  if (options.ignoreWhitespace) {
    return line.trim().split(/\s+/).filter(w => w.length > 0);
  }
  // Preserve whitespace by splitting on word boundaries
  const words: string[] = [];
  const regex = /\S+/g;
  let match;
  while ((match = regex.exec(line)) !== null) {
    words.push(match[0]);
  }
  return words;
}

/**
 * Normalizes words for comparison
 */
function normalizeWord(word: string, options: ComparisonOptions): string {
  let normalized = word;
  if (!options.caseSensitive) {
    normalized = normalized.toLowerCase();
  }
  return normalized;
}

/**
 * Computes word-by-word diff using LCS algorithm
 * Returns words with their diff status and preserves spacing
 */
function computeWordDiff(
  words1: string[],
  words2: string[],
  normalized1: string[],
  normalized2: string[]
): { leftWords: WordDiff[]; rightWords: WordDiff[] } {
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
  
  // Build word diff by backtracking
  const leftWords: WordDiff[] = [];
  const rightWords: WordDiff[] = [];
  let i = n;
  let j = m;
  
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && normalized1[i - 1] === normalized2[j - 1]) {
      // Words match - unchanged
      leftWords.unshift({ word: words1[i - 1], type: 'unchanged' });
      rightWords.unshift({ word: words2[j - 1], type: 'unchanged' });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      // Word added on right
      rightWords.unshift({ word: words2[j - 1], type: 'added' });
      j--;
    } else if (i > 0) {
      // Word removed from left
      leftWords.unshift({ word: words1[i - 1], type: 'removed' });
      i--;
    }
  }
  
  // Check for modifications: pair up removed and added words
  // Strategy: Collect sequences of removed/added words between unchanged words and pair them
  const resultLeft: WordDiff[] = [];
  const resultRight: WordDiff[] = [];
  
  // First, collect all removed and added words in sequences
  // The LCS algorithm produces aligned arrays, so we process them together
  let idx = 0;
  let jdx = 0;
  
  while (idx < leftWords.length || jdx < rightWords.length) {
    const leftWord = leftWords[idx];
    const rightWord = rightWords[jdx];
    
    // Both unchanged at same position - keep aligned
    if (leftWord && rightWord && 
        leftWord.type === 'unchanged' && rightWord.type === 'unchanged') {
      resultLeft.push(leftWord);
      resultRight.push(rightWord);
      idx++;
      jdx++;
    }
    // Both removed+added at same position - pair as modified
    else if (leftWord && rightWord && 
             leftWord.type === 'removed' && rightWord.type === 'added') {
      resultLeft.push({ word: leftWord.word, type: 'modified' });
      resultRight.push({ word: rightWord.word, type: 'modified' });
      idx++;
      jdx++;
    }
    // Collect a change region: sequences of removed/added words
    else {
      // Collect removed words from left
      const removedWords: WordDiff[] = [];
      while (idx < leftWords.length && leftWords[idx] && leftWords[idx].type === 'removed') {
        removedWords.push(leftWords[idx]);
        idx++;
      }
      
      // Collect added words from right
      const addedWords: WordDiff[] = [];
      while (jdx < rightWords.length && rightWords[jdx] && rightWords[jdx].type === 'added') {
        addedWords.push(rightWords[jdx]);
        jdx++;
      }
      
      // Pair them up: each removed word pairs with an added word if available
      const pairCount = Math.min(removedWords.length, addedWords.length);
      for (let k = 0; k < pairCount; k++) {
        resultLeft.push({ word: removedWords[k].word, type: 'modified' });
        resultRight.push({ word: addedWords[k].word, type: 'modified' });
      }
      
      // Remaining removed words (no pairing available)
      for (let k = pairCount; k < removedWords.length; k++) {
        resultLeft.push(removedWords[k]);
      }
      
      // Remaining added words (no pairing available)
      for (let k = pairCount; k < addedWords.length; k++) {
        resultRight.push(addedWords[k]);
      }
      
      // Handle case where one side has unchanged but other has removed/added
      if (leftWord && leftWord.type === 'unchanged') {
        resultLeft.push(leftWord);
        idx++;
      }
      if (rightWord && rightWord.type === 'unchanged') {
        resultRight.push(rightWord);
        jdx++;
      }
    }
  }
  
  return { leftWords: resultLeft, rightWords: resultRight };
}

/**
 * Compares two texts word-by-word while preserving line structure and line numbers
 */
function compareWords(
  text1: string,
  text2: string,
  options: ComparisonOptions
): TextCompareResult {
  // Split into lines to preserve line numbers
  const lines1 = text1.split(/\r?\n/);
  const lines2 = text2.split(/\r?\n/);
  
  const maxLines = Math.max(lines1.length, lines2.length);
  const diffLines: DiffLine[] = [];
  
  for (let i = 0; i < maxLines; i++) {
    const line1 = lines1[i];
    const line2 = lines2[i];
    
    if (line1 === undefined && line2 === undefined) {
      // Both undefined - shouldn't happen but handle gracefully
      continue;
    } else if (line1 === undefined) {
      // Line only in right - Added (green)
      const words2 = splitIntoWords(line2, options);
      diffLines.push({
        lineNumber: i + 1,
        leftLineNumber: undefined,
        rightLineNumber: i + 1,
        left: undefined,
        right: line2,
        type: 'added',
        leftWords: [],
        rightWords: words2.map(w => ({ word: w, type: 'added' as const })),
      });
    } else if (line2 === undefined) {
      // Line only in left - Removed (red)
      const words1 = splitIntoWords(line1, options);
      diffLines.push({
        lineNumber: i + 1,
        leftLineNumber: i + 1,
        rightLineNumber: undefined,
        left: line1,
        right: undefined,
        type: 'removed',
        leftWords: words1.map(w => ({ word: w, type: 'removed' as const })),
        rightWords: [],
      });
    } else {
      // Both lines exist - compare words
      const words1 = splitIntoWords(line1, options);
      const words2 = splitIntoWords(line2, options);
      
      // Normalize words for comparison
      const normalized1 = words1.map(w => normalizeWord(w, options));
      const normalized2 = words2.map(w => normalizeWord(w, options));
      
      // Compute word-by-word diff
      const { leftWords, rightWords } = computeWordDiff(words1, words2, normalized1, normalized2);
      
      // Determine line type based on word diffs
      const hasChanges = leftWords.some(w => w.type !== 'unchanged') || 
                         rightWords.some(w => w.type !== 'unchanged');
      
      const lineType = hasChanges ? 'modified' : 'unchanged';
      
      diffLines.push({
        lineNumber: i + 1,
        leftLineNumber: i + 1,
        rightLineNumber: i + 1,
        left: line1,
        right: line2,
        type: lineType,
        leftWords,
        rightWords,
      });
    }
  }
  
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
  
  // Count word-level differences (not line-level)
  // Modified words appear in both leftWords and rightWords, so count them only once (from leftWords)
  // Added words only appear in rightWords
  // Removed words only appear in leftWords
  // For modified words: count consecutive sequences as a single change
  let addedCount = 0;
  let removedCount = 0;
  let modifiedCount = 0;
  
  diffLines.forEach(diff => {
    // Count words from leftWords (removed and modified)
    // For modified words: count consecutive sequences as a single change
    if (diff.leftWords) {
      let inModifiedSequence = false;
      diff.leftWords.forEach(word => {
        if (word.type === 'removed') {
          removedCount++;
          inModifiedSequence = false;
        } else if (word.type === 'modified') {
          // Count the start of a consecutive sequence of modified words as a single change
          if (!inModifiedSequence) {
            modifiedCount++;
            inModifiedSequence = true;
          }
        } else {
          // unchanged word
          inModifiedSequence = false;
        }
      });
    }
    
    // Count words from rightWords (added only, modified are already counted from leftWords)
    if (diff.rightWords) {
      diff.rightWords.forEach(word => {
        if (word.type === 'added') {
          addedCount++;
        }
        // Modified words are counted from leftWords only to avoid double counting
      });
    }
  });
  
  const totalChanges = addedCount + removedCount + modifiedCount;
  
  return {
    areEqual: totalChanges === 0,
    differences,
    totalChanges,
    differencesCount: totalChanges,
    diffLines,
    addedCount,
    removedCount,
    modifiedCount,
  };
}

/**
 * Compares two text strings line by line or word by word with options
 */
export function compareText(
  text1: string,
  text2: string,
  options: ComparisonOptions,
  mode: 'line' | 'word' = 'line'
): TextCompareResult {
  if (mode === 'word') {
    return compareWords(text1, text2, options);
  }
  
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
  
  // Count actual differences (added + removed + modified, not counting modified twice)
  const addedCount = diffLines.filter(d => d.type === 'added').length;
  const removedCount = diffLines.filter(d => d.type === 'removed').length;
  const modifiedCount = diffLines.filter(d => d.type === 'modified').length;
  const totalChanges = addedCount + removedCount + modifiedCount;
  
  return {
    areEqual: totalChanges === 0,
    differences,
    totalChanges,
    differencesCount: totalChanges,
    diffLines,
    addedCount,
    removedCount,
    modifiedCount,
  };
}

/**
 * Computes line-by-line diff using LCS algorithm
 * Preserves original line numbers while correctly identifying adds/removes/modifications
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
  
  // Build diff by backtracking
  const diff: DiffLine[] = [];
  let i = n;
  let j = m;
  let diffLineNumber = 1;
  
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && normalized1[i - 1] === normalized2[j - 1]) {
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
  
  // Check for modifications: if consecutive removed+added pairs have the same position, mark as modified
  // According to legend: Yellow = Changed line (same position, different content)
  const result: DiffLine[] = [];
  for (let k = 0; k < diff.length; k++) {
    const current = diff[k];
    const next = diff[k + 1];
    
    // Check if current is removed and next is added at the same diff position
    if (current.type === 'removed' && next && next.type === 'added') {
      // Check if they're at the same relative position (adjacent in diff)
      // If left line number and right line number are close, treat as modified
      const leftPos = current.leftLineNumber ?? 0;
      const rightPos = next.rightLineNumber ?? 0;
      
      // If positions are the same or very close (within 1 line), treat as modification
      // This ensures "same position, different content" maps to yellow (changed)
      if (Math.abs(leftPos - rightPos) <= 1) {
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
        // Positions are different - treat as separate removed and added
        result.push(current);
      }
    } else {
      result.push(current);
    }
  }
  
  return result;
}

/**
 * Word-level comparison utilities
 * Implements LCS algorithm for word-by-word comparison
 */

import type { WordDiff } from './diffChecker';

export interface WordComparisonOptions {
  ignoreWhitespace?: boolean;
  caseSensitive?: boolean;
}

/**
 * Split a line into words
 */
export function splitIntoWords(line: string, options: WordComparisonOptions): string[] {
  if (options.ignoreWhitespace) {
    return line.trim().split(/\s+/).filter(w => w.length > 0);
  }
  
  // Extract words while preserving whitespace structure
  const words: string[] = [];
  const regex = /\S+/g;
  let match;
  let lastIndex = 0;
  
  while ((match = regex.exec(line)) !== null) {
    // Add any whitespace before the word
    if (match.index > lastIndex) {
      words.push(line.substring(lastIndex, match.index));
    }
    // Add the word
    words.push(match[0]);
    lastIndex = regex.lastIndex;
  }
  
  // Add any trailing whitespace
  if (lastIndex < line.length) {
    words.push(line.substring(lastIndex));
  }
  
  return words;
}

/**
 * Normalize a word for comparison
 */
export function normalizeWord(word: string, options: WordComparisonOptions): string {
  if (!options.caseSensitive) {
    return word.toLowerCase();
  }
  return word;
}

/**
 * Compute word-level diff using LCS algorithm
 */
export function computeWordDiff(
  words1: string[],
  words2: string[],
  options: WordComparisonOptions
): { leftWords: WordDiff[]; rightWords: WordDiff[] } {
  const n = words1.length;
  const m = words2.length;
  
  // Normalize words for comparison
  const normalized1 = words1.map(w => normalizeWord(w, options));
  const normalized2 = words2.map(w => normalizeWord(w, options));
  
  // Build LCS matrix
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
  
  // Backtrack to find word differences
  const leftWords: WordDiff[] = [];
  const rightWords: WordDiff[] = [];
  
  let i = n;
  let j = m;
  
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && normalized1[i - 1] === normalized2[j - 1]) {
      // Words match
      leftWords.unshift({ word: words1[i - 1], type: 'unchanged' });
      rightWords.unshift({ word: words2[j - 1], type: 'unchanged' });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      // Word added in right
      rightWords.unshift({ word: words2[j - 1], type: 'added' });
      j--;
    } else if (i > 0) {
      // Word removed from left
      leftWords.unshift({ word: words1[i - 1], type: 'removed' });
      i--;
    }
  }
  
  // Pair removed + added words as modified
  // Strategy: Look for consecutive sequences of removed/added words and pair them
  const pairedLeftWords: WordDiff[] = [];
  const pairedRightWords: WordDiff[] = [];
  
  let leftIdx = 0;
  let rightIdx = 0;
  
  while (leftIdx < leftWords.length || rightIdx < rightWords.length) {
    const leftWord = leftWords[leftIdx];
    const rightWord = rightWords[rightIdx];
    
    // Both unchanged - keep as is
    if (leftWord && leftWord.type === 'unchanged' && rightWord && rightWord.type === 'unchanged') {
      pairedLeftWords.push(leftWord);
      pairedRightWords.push(rightWord);
      leftIdx++;
      rightIdx++;
    }
    // Removed + Added - pair as changed (modified)
    else if (leftWord && leftWord.type === 'removed' && rightWord && rightWord.type === 'added') {
      pairedLeftWords.push({ word: leftWord.word, type: 'changed' });
      pairedRightWords.push({ word: rightWord.word, type: 'changed' });
      leftIdx++;
      rightIdx++;
    }
    // Only removed - keep as removed
    else if (leftWord && leftWord.type === 'removed') {
      pairedLeftWords.push(leftWord);
      leftIdx++;
    }
    // Only added - keep as added
    else if (rightWord && rightWord.type === 'added') {
      pairedRightWords.push(rightWord);
      rightIdx++;
    }
    // Fallback: advance both
    else {
      if (leftWord) {
        pairedLeftWords.push(leftWord);
        leftIdx++;
      }
      if (rightWord) {
        pairedRightWords.push(rightWord);
        rightIdx++;
      }
    }
  }
  
  return {
    leftWords: pairedLeftWords,
    rightWords: pairedRightWords,
  };
}

/**
 * Compare two lines word by word
 */
export function compareWords(
  line1: string,
  line2: string,
  options: WordComparisonOptions
): { leftWords: WordDiff[]; rightWords: WordDiff[] } {
  const words1 = splitIntoWords(line1, options);
  const words2 = splitIntoWords(line2, options);
  
  return computeWordDiff(words1, words2, options);
}


export interface WordDiff {
  word: string;
  type: 'added' | 'removed' | 'modified' | 'unchanged';
}

export interface DiffLine {
  lineNumber: number; // Sequential line number in diff output (for backward compatibility)
  leftLineNumber?: number; // Original line number from left input
  rightLineNumber?: number; // Original line number from right input
  left?: string;
  right?: string;
  type: 'added' | 'removed' | 'modified' | 'unchanged';
  // Word-level diff for word comparison mode
  leftWords?: WordDiff[];
  rightWords?: WordDiff[];
}


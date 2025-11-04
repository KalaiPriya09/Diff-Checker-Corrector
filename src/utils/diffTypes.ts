export interface DiffLine {
  lineNumber: number;
  left?: string;
  right?: string;
  type: 'added' | 'removed' | 'modified' | 'unchanged';
}


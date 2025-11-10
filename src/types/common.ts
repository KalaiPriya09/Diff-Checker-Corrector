/**
 * Common types used across the application
 */

// Application Types
export type ThemeMode = 'light' | 'dark';

export type ComponentType = 
  | 'json-validate' 
  | 'json-compare' 
  | 'xml-validate' 
  | 'xml-compare' 
  | 'text-compare';

export type ViewType =
  | 'json-validate'
  | 'xml-validate'
  | 'json-compare'
  | 'xml-compare'
  | 'text-compare';

// Session Storage Types
export interface SessionData {
  input?: string;
  leftInput?: string;
  rightInput?: string;
  format?: 'json' | 'xml' | 'text';
  comparisonOptions?: ComparisonOptions;
  timestamp: number;
  componentType: ComponentType;
}

// Validation Result Types
export interface JsonValidationResult {
  isValid: boolean;
  error?: string;
  position?: { line: number; column: number };
}

export interface XmlValidationResult {
  isValid: boolean;
  error?: string;
  position?: { line: number; column: number };
}

// Comparison Options
export interface ComparisonOptions {
  caseSensitive: boolean;
  ignoreWhitespace: boolean;
  ignoreKeyOrder?: boolean;
  ignoreAttributeOrder?: boolean;
  ignoreArrayOrder?: boolean;
}

// JSON Compare Types
export interface JsonDifference {
  type: 'added' | 'removed' | 'modified';
  path: string;
  oldValue?: unknown;
  newValue?: unknown;
  message: string;
}

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

// XML Compare Types
export interface XmlDifference {
  type: 'added' | 'removed' | 'modified' | 'attribute_changed';
  path: string;
  element?: string;
  attribute?: string;
  oldValue?: string;
  newValue?: string;
  message: string;
}

export interface XmlCompareResult {
  areEqual: boolean;
  differences: XmlDifference[];
  differencesCount: number;
  diffLines: DiffLine[];
  addedCount?: number;
  removedCount?: number;
  modifiedCount?: number;
  hasParseError?: boolean;
  parseErrorMessage?: string;
}

// Text Compare Types
export interface TextDifference {
  type: 'added' | 'removed' | 'unchanged';
  line: number;
  content: string;
}

export interface TextCompareResult {
  areEqual: boolean;
  differences: TextDifference[];
  totalChanges: number;
  differencesCount: number;
  diffLines: DiffLine[];
  addedCount?: number;
  removedCount?: number;
  modifiedCount?: number;
}

// Diff Types
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

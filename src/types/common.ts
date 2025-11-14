/**
 * Common types used across the application
 */

// Diff Checker Types
export type FormatType = 'json' | 'xml' | 'text';
export type ModeType = 'compare' | 'validate';
export type componentType = 'json-compare' | 'xml-compare' | 'text-compare' | 'json-validate' | 'xml-validate';
// Session Storage Types
export interface SessionData {
  input?: string;
  leftInput?: string;
  rightInput?: string;
  format?: 'json' | 'xml' | 'text';
  comparisonOptions?: DiffOptions;
  timestamp: number;
  componentType: componentType;
}
export type TextCompareMode = 'line' | 'word';

export interface DiffOptions {
  ignoreWhitespace: boolean;
  caseSensitive: boolean;
  ignoreKeyOrder: boolean;
  ignoreAttributeOrder: boolean;
  ignoreArrayOrder: boolean;
  textCompareMode?: TextCompareMode;
}

export interface ValidationResult {
  isValid: boolean;
  formatted?: string;
  error?: string;
}

export type ThemeMode = 'light' | 'dark';
export type ComponentType = 'diff-checker' | 'encryption' | 'other';

/**
 * File Validation Utilities
 * 
 * Centralized validation logic for file uploads and drag-drop operations
 */

export const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB

export type FileFormat = 'json' | 'xml' | 'text';

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
  errorTitle?: string;
}

/**
 * Validate file size
 */
export const validateFileSize = (file: File): FileValidationResult => {
  if (file.size > MAX_FILE_SIZE) {
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
    return {
      isValid: false,
      errorTitle: 'File Too Large',
      error: 
        `File size: ${fileSizeMB} MB\n` +
        `Maximum allowed: 2 MB\n\n` +
        `Please select a smaller file or compress the content.`,
    };
  }
  return { isValid: true };
};

/**
 * Validate file format
 */
export const validateFileFormat = (
  file: File,
  expectedFormat: FileFormat
): FileValidationResult => {
  const fileName = file.name.toLowerCase();
  const fileExtension = fileName.split('.').pop() || '';

  // Handle edge case: file without extension or empty filename
  // Allow text format for files without extensions
  if (!fileName || !fileName.includes('.') || fileExtension === fileName) {
    if (expectedFormat === 'text') {
      return { isValid: true };
    }
  }

  const validExtensions: Record<FileFormat, string[]> = {
    json: ['json'],
    xml: ['xml'],
    text: ['txt', 'text', ''], // Allow empty extension for text
  };

  const allowedExtensions = validExtensions[expectedFormat];

  if (!allowedExtensions.includes(fileExtension)) {
    return {
      isValid: false,
      errorTitle: 'Invalid File Format',
      error:
        `Expected: .${allowedExtensions.filter(ext => ext).join(', .')}\n` +
        `Received: .${fileExtension}\n\n` +
        `Please select "${expectedFormat.toUpperCase()}" format in the dropdown or choose a matching file.`,
    };
  }

  return { isValid: true };
};

/**
 * Comprehensive file validation
 */
export const validateFile = (
  file: File, 
  expectedFormat: FileFormat
): FileValidationResult => {
  // Check file size first
  const sizeValidation = validateFileSize(file);
  if (!sizeValidation.isValid) {
    return sizeValidation;
  }
  
  // Check file format
  const formatValidation = validateFileFormat(file, expectedFormat);
  if (!formatValidation.isValid) {
    return formatValidation;
  }
  
  return { isValid: true };
};

/**
 * Validate clipboard content size
 */
export const validateClipboardSize = (text: string): FileValidationResult => {
  const textSize = new TextEncoder().encode(text).length;
  
  if (textSize > MAX_FILE_SIZE) {
    const sizeMB = (textSize / (1024 * 1024)).toFixed(2);
    return {
      isValid: false,
      errorTitle: 'Clipboard Content Too Large',
      error:
        `Content size: ${sizeMB} MB\n` +
        `Maximum allowed: 2 MB\n\n` +
        `Please paste smaller content or use file upload with compression.`,
    };
  }
  
  return { isValid: true };
};

/**
 * Format bytes to human-readable string
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

/**
 * Get accepted file extensions for a format
 */
export const getAcceptedExtensions = (format: FileFormat): string => {
  const extensions: Record<FileFormat, string> = {
    json: '.json',
    xml: '.xml',
    text: '.txt',
  };
  return extensions[format];
};


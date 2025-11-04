/**
 * Utility functions for file operations (upload, copy, download)
 */

import { MAX_INPUT_SIZE, formatSize } from './sizeLimits';

/**
 * Read file as text
 */
export function readFileAsText(file: File, maxSize?: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const sizeLimit = maxSize || MAX_INPUT_SIZE;
    
    if (file.size > sizeLimit) {
      reject(new Error(`File size (${formatSize(file.size)}) exceeds maximum of ${formatSize(sizeLimit)}`));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      // Check the actual string size (may differ from file size for text files)
      const contentSize = new TextEncoder().encode(content).length;
      if (contentSize > sizeLimit) {
        reject(new Error(`Content size (${formatSize(contentSize)}) exceeds maximum of ${formatSize(sizeLimit)}`));
        return;
      }
      resolve(content);
    };
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    reader.readAsText(file);
  });
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<void> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
      } catch {
        throw new Error('Failed to copy text');
      }
      document.body.removeChild(textArea);
    }
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to copy text');
  }
}

/**
 * Download text as file
 */
export function downloadTextAsFile(content: string, filename: string, mimeType: string = 'text/plain'): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Get file extension and MIME type based on view type
 */
export function getFileInfo(viewType: string): { extension: string; mimeType: string } {
  switch (viewType) {
    case 'json-validate':
    case 'json-compare':
      return { extension: '.json', mimeType: 'application/json' };
    case 'xml-validate':
    case 'xml-compare':
      return { extension: '.xml', mimeType: 'application/xml' };
    case 'text-compare':
      return { extension: '.txt', mimeType: 'text/plain' };
    default:
      return { extension: '.txt', mimeType: 'text/plain' };
  }
}

/**
 * Get default filename based on view type
 */
export function getDefaultFilename(viewType: string, side?: 'left' | 'right'): string {
  const { extension } = getFileInfo(viewType);
  const timestamp = new Date().toISOString().slice(0, 10);
  
  if (side) {
    return `${viewType}-${side}-${timestamp}${extension}`;
  }
  return `${viewType}-${timestamp}${extension}`;
}


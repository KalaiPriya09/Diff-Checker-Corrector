/**
 * Utility functions for file operations (upload, copy, download)
 */

import { validateSize, validateContentSize } from './sizeLimits';

/**
 * Read file as text
 */
export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const fileSizeValidation = validateSize(file.size);
    if (!fileSizeValidation.valid) {
      reject(new Error(fileSizeValidation.error || 'File too large. Maximum allowed size is 2 MB.'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const contentValidation = validateContentSize(content);
      if (!contentValidation.valid) {
        reject(new Error(contentValidation.error || 'Content too large. Maximum allowed size is 2 MB.'));
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

/**
 * Load content from a URL
 * Handles CORS, size limits, and various error cases
 * @param url - The URL to load content from
 * @param viewType - Optional view type to validate URL extension (e.g., 'xml-validate' checks for .xml)
 */
export async function loadContentFromUrl(url: string, viewType?: string): Promise<string> {
  // Validate URL format
  try {
    new URL(url);
  } catch {
    throw new Error('Invalid URL format. Please enter a valid URL (e.g., https://example.com/data.json)');
  }

  // Only allow http/https protocols for security
  const urlObj = new URL(url);
  if (!['http:', 'https:'].includes(urlObj.protocol)) {
    throw new Error('Only HTTP and HTTPS URLs are allowed');
  }

  // Validate file extension based on view type
  if (viewType) {
    const urlPath = urlObj.pathname.toLowerCase();
    if (viewType.includes('xml')) {
      if (!urlPath.endsWith('.xml')) {
        throw new Error('URL must point to an XML file (.xml extension required)');
      }
    } else if (viewType.includes('json')) {
      if (!urlPath.endsWith('.json')) {
        throw new Error('URL must point to a JSON file (.json extension required)');
      }
    }
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json, application/xml, text/xml, text/plain, */*',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Failed to load URL: ${response.status} ${response.statusText}`);
    }

    // Check content length from headers if available
    const contentLength = response.headers.get('content-length');
    if (contentLength) {
      const size = parseInt(contentLength, 10);
      const sizeValidation = validateSize(size);
      if (!sizeValidation.valid) {
        throw new Error(sizeValidation.error || 'Content too large. Maximum allowed size is 2 MB.');
      }
    }

    // Read the response as text
    const content = await response.text();
    
    // Check actual content size
    const contentValidation = validateContentSize(content);
    if (!contentValidation.valid) {
      throw new Error(contentValidation.error || 'Content too large. Maximum allowed size is 2 MB.');
    }

    if (!content.trim()) {
      throw new Error('The URL returned empty content');
    }

    return content;
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timed out. Please check your internet connection and try again.');
      }
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        throw new Error('Failed to fetch URL. This may be due to CORS restrictions or network issues. Please try a different URL or use a CORS proxy.');
      }
      throw error;
    }
    throw new Error('An unknown error occurred while loading the URL');
  }
}


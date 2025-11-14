export const MAX_INPUT_SIZE = 2 * 1024 * 1024; // 2 MB in bytes

export function getStringSizeInBytes(str: string): number {
  return new TextEncoder().encode(str).length;
}

export function exceedsMaxSize(content: string): boolean {
  return getStringSizeInBytes(content) > MAX_INPUT_SIZE;
}

export function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

export function validateSize(sizeInBytes: number): { valid: boolean; error?: string } {
  if (sizeInBytes > MAX_INPUT_SIZE) {
    const actualSizeMB = (sizeInBytes / (1024 * 1024)).toFixed(2);
    return {
      valid: false,
      error: `Content size is ${actualSizeMB} MB. Maximum allowed size is 2 MB.`
    };
  }
  return { valid: true };
}

export function validateContentSize(content: string): { valid: boolean; error?: string } {
  const sizeInBytes = getStringSizeInBytes(content);
  return validateSize(sizeInBytes);
}

export function validateFileSize(file: File): { valid: boolean; error?: string } {
  return validateSize(file.size);
}


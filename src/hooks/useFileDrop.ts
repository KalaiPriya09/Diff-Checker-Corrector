import { useCallback, useState } from 'react';
import { validateFileSize, validateContentSize } from '../utils/sizeLimits';

export interface UseFileDropOptions {
  onDrop?: (content: string, fileName: string) => void;
  onError?: (error: string) => void;
  acceptTypes?: string[];
  maxSize?: number; // in bytes
}

export function useFileDrop(options: UseFileDropOptions = {}) {
  const [isDragging, setIsDragging] = useState(false);
  const { onDrop, onError, acceptTypes = [] } = options;

  const readFileAsText = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const sizeValidation = validateFileSize(file);
      
      if (!sizeValidation.valid) {
        reject(new Error(sizeValidation.error || 'File too large. Maximum allowed size is 2 MB.'));
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
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    const file = files[0]; // Only handle first file

    // Check file type if acceptTypes are specified
    if (acceptTypes.length > 0) {
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      const fileName = file.name.toLowerCase();
      const mimeType = file.type.toLowerCase();

      const isAccepted = acceptTypes.some(type => {
        const lowerType = type.toLowerCase();
        const typeWithoutDot = lowerType.replace(/^\./, '');
        return (
          fileName.endsWith(lowerType) ||
          fileExtension === lowerType ||
          mimeType.includes(typeWithoutDot) ||
          mimeType === lowerType
        );
      });

      if (!isAccepted) {
        const acceptedTypesDisplay = acceptTypes
          .filter(type => type.startsWith('.'))
          .map(type => type.toLowerCase())
          .join(', ');
        onError?.(`Please upload a valid file type: ${acceptedTypesDisplay || acceptTypes.join(', ')}`);
        return;
      }
    }

    const sizeValidation = validateFileSize(file);
    if (!sizeValidation.valid) {
      onError?.(sizeValidation.error || 'File too large. Maximum allowed size is 2 MB.');
      return;
    }

    try {
      const content = await readFileAsText(file);
      onDrop?.(content, file.name);
    } catch (error) {
      onError?.(error instanceof Error ? error.message : 'Failed to read file');
    }
  }, [acceptTypes, onDrop, onError, readFileAsText]);

  return {
    isDragging,
    dragHandlers: {
      onDragEnter: handleDragEnter,
      onDragLeave: handleDragLeave,
      onDragOver: handleDragOver,
      onDrop: handleDrop,
    },
  };
}


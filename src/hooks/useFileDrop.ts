import { useCallback, useState } from 'react';
import { MAX_INPUT_SIZE } from '../utils/sizeLimits';

export interface UseFileDropOptions {
  onDrop?: (content: string, fileName: string) => void;
  onError?: (error: string) => void;
  acceptTypes?: string[];
  maxSize?: number; // in bytes
}

export function useFileDrop(options: UseFileDropOptions = {}) {
  const [isDragging, setIsDragging] = useState(false);
  const { onDrop, onError, acceptTypes = [], maxSize = MAX_INPUT_SIZE } = options;

  const readFileAsText = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (maxSize && file.size > maxSize) {
        reject(new Error(`File size exceeds maximum of ${Math.round(maxSize / 1024 / 1024)}MB`));
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        resolve(e.target?.result as string);
      };
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      reader.readAsText(file);
    });
  }, [maxSize]);

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


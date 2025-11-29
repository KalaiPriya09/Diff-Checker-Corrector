import { useState, useCallback, DragEvent } from 'react';

export interface UseDragAndDropOptions {
  onDrop: (content: string, file: File) => void;
  accept?: string[];
  maxSize?: number; // in bytes
  onError?: (error: string) => void; // Error callback
}

export interface UseDragAndDropReturn {
  isDragging: boolean;
  isDragOver: boolean;
  onDragEnter: (e: DragEvent<HTMLElement>) => void;
  onDragOver: (e: DragEvent<HTMLElement>) => void;
  onDragLeave: (e: DragEvent<HTMLElement>) => void;
  onDrop: (e: DragEvent<HTMLElement>) => void;
}

/**
 * Custom hook for handling drag and drop functionality
 */
export const useDragAndDrop = ({
  onDrop: handleDrop,
  accept = ['.json', '.xml', '.txt', '.text'],
  maxSize = 10 * 1024 * 1024, // 10MB default
  onError,
}: UseDragAndDropOptions): UseDragAndDropReturn => {
  const [isDragging, setIsDragging] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const readFile = useCallback(
    async (file: File): Promise<string> => {
      return new Promise((resolve, reject) => {
        // Check file size
        if (file.size > maxSize) {
          reject(new Error(`File size exceeds maximum allowed size of ${(maxSize / 1024 / 1024).toFixed(2)}MB`));
          return;
        }

        // Check file type - strictly enforce accepted extensions
        // Use lastIndexOf to handle filenames with multiple dots or special characters
        const fileName = file.name.toLowerCase().trim();
        const lastDotIndex = fileName.lastIndexOf('.');
        const fileExtension = lastDotIndex !== -1 && lastDotIndex < fileName.length - 1
          ? fileName.substring(lastDotIndex + 1).trim()
          : null;
        const acceptedExtensions = accept.map((ext) => ext.replace(/^\./, '').toLowerCase().trim());
        
        if (!fileExtension || fileExtension.length === 0 || !acceptedExtensions.includes(fileExtension)) {
          const fileNameForError = file.name || 'Unknown file';
          const extensionInfo = fileExtension ? `.${fileExtension}` : 'no extension';
          const acceptedTypesList = accept.join(', ');
          reject(new Error(
            `File type not supported.\n\nFile: "${fileNameForError}"\nExtension: ${extensionInfo}\nAccepted types: ${acceptedTypesList}\n\nPlease select a file with one of the accepted extensions.`
          ));
          return;
        }

        const reader = new FileReader();

        reader.onload = (e) => {
          const content = e.target?.result as string;
          resolve(content);
        };

        reader.onerror = () => {
          reject(new Error('Failed to read file'));
        };

        reader.readAsText(file);
      });
    },
    [accept, maxSize]
  );

  const onDragEnter = useCallback((e: DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
      setIsDragOver(true);
    }
  }, []);

  const onDragOver = useCallback((e: DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      e.dataTransfer.dropEffect = 'copy';
      setIsDragOver(true);
    }
  }, []);

  const onDragLeave = useCallback((e: DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Only set drag over to false if we're leaving the drop zone
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setIsDragOver(false);
      setIsDragging(false);
    }
  }, []);

  const onDrop = useCallback(
    async (e: DragEvent<HTMLElement>) => {
      e.preventDefault();
      e.stopPropagation();
      
      setIsDragging(false);
      setIsDragOver(false);

      const files = Array.from(e.dataTransfer.files);
      
      if (files.length === 0) {
        return;
      }

      // Only process the first file
      const file = files[0];

      try {
        const content = await readFile(file);
        handleDrop(content, file);
      } catch (error) {
        // Extract error message
        const errorMessage = error instanceof Error ? error.message : 'Failed to read file';
        
        // Call error handler if provided - this will show the alert
        if (onError) {
          onError(errorMessage);
        } else {
          // Fallback if no error handler provided
          alert(errorMessage);
        }
        
        // Prevent the error from propagating as unhandled
        // The error is already handled via onError callback
        return;
      }
    },
    [readFile, handleDrop, onError]
  );

  return {
    isDragging,
    isDragOver,
    onDragEnter,
    onDragOver,
    onDragLeave,
    onDrop,
  };
};


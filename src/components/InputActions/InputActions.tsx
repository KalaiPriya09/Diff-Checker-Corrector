import React, { useRef, useCallback, useState } from 'react';
import { copyToClipboard, downloadTextAsFile, readFileAsText, getDefaultFilename, getFileInfo, loadContentFromUrl } from '../../utils/fileOperations';
import { validateFileSize } from '../../utils/sizeLimits';
import { formatContent } from '../../utils/formatters';
import { Button } from '../button';
import { UrlModal } from '../UrlModal';
import {
  ActionButtonsContainer,
  FileInput,
} from './InputActions.styles';

export interface InputActionsProps {
  content: string;
  viewType: string;
  side?: 'left' | 'right';
  onFileLoad?: (content: string, fileName: string) => void;
  onError?: (error: string) => void;
  acceptTypes?: string[];
  onFormat?: (formattedContent: string) => void;
  onSampleLoad?: (sampleContent: string) => void;
  onUrlLoad?: (content: string) => void;
}

export const InputActions: React.FC<InputActionsProps> = ({
  content,
  viewType,
  side,
  onFileLoad,
  onError,
  acceptTypes = [],
  onFormat,
  onSampleLoad,
  onUrlLoad,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showUrlModal, setShowUrlModal] = useState(false);

  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input value to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

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
      const fileContent = await readFileAsText(file);
      onFileLoad?.(fileContent, file.name);
    } catch (error) {
      onError?.(error instanceof Error ? error.message : 'Failed to read file');
    }
  }, [acceptTypes, onFileLoad, onError]);

  const handleCopy = useCallback(async () => {
    if (!content.trim()) {
      onError?.('No content to copy');
      return;
    }

    try {
      await copyToClipboard(content);
      // You could add a success toast here if needed
    } catch (error) {
      onError?.(error instanceof Error ? error.message : 'Failed to copy to clipboard');
    }
  }, [content, onError]);

  const handleDownload = useCallback(() => {
    if (!content.trim()) {
      onError?.('No content to download');
      return;
    }

    try {
      const filename = getDefaultFilename(viewType, side);
      const { mimeType } = getFileInfo(viewType);
      downloadTextAsFile(content, filename, mimeType);
    } catch (error) {
      onError?.(error instanceof Error ? error.message : 'Failed to download file');
    }
  }, [content, viewType, side, onError]);

  const handlePrettier = useCallback(() => {
    if (!content.trim()) {
      onError?.('No content to format');
      return;
    }

    try {
      const formatted = formatContent(content, viewType);
      onFormat?.(formatted);
    } catch {
      onError?.('⚠️ Unable to prettify: Invalid format detected.');
    }
  }, [content, viewType, onFormat, onError]);

  const handleUrlLoad = useCallback(async (url: string) => {
    try {
      const urlContent = await loadContentFromUrl(url, viewType);
      onUrlLoad?.(urlContent);
      setShowUrlModal(false);
    } catch {
      onError?.('Failed to load URL');
    }
  }, [onUrlLoad, viewType, onError]);

  return (
    <>
      <ActionButtonsContainer>
        <Button onClick={handleUploadClick} title="Upload File" variant="action">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="17 8 12 3 7 8"></polyline>
            <line x1="12" y1="3" x2="12" y2="15"></line>
          </svg>
          <span>Upload</span>
        </Button>
        {onUrlLoad && (
          <Button onClick={() => setShowUrlModal(true)} title="Load URL" variant="action">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15 3 21 3 21 9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
            <span>Load URL</span>
          </Button>
        )}
      {viewType !== 'text-compare' && (
        <Button onClick={handlePrettier} title="Format Code" variant="action">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 3L3 8l5 5"></path>
            <path d="M16 3l5 5-5 5"></path>
            <path d="M12 19h6"></path>
          </svg>
          <span>Prettier</span>
        </Button>
      )}
      <Button onClick={handleCopy} title="Copy to Clipboard" variant="action">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>
        <span>Copy</span>
      </Button>
      <Button onClick={handleDownload} title="Download as File" variant="action">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="7 10 12 15 17 10"></polyline>
          <line x1="12" y1="15" x2="12" y2="3"></line>
        </svg>
        <span>Download</span>
      </Button>
      {onSampleLoad && (
        <Button onClick={() => onSampleLoad('')} title="Load Sample Code" variant="action">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
          <span>Sample</span>
        </Button>
      )}
        <FileInput
          ref={fileInputRef}
          type="file"
          accept={acceptTypes.join(',')}
          onChange={handleFileChange}
        />
      </ActionButtonsContainer>
      {onUrlLoad && (
        <UrlModal
          show={showUrlModal}
          onClose={() => setShowUrlModal(false)}
          onLoad={handleUrlLoad}
          title="Load URL"
          sampleUrl={viewType?.includes('json') ? "https://gist.githubusercontent.com/cbmgit/852c2702d4342e7811c95f8ffc2f017f/raw/InsuranceCompanies.json" : undefined}
          viewType={viewType}
        />
      )}
    </>
  );
};


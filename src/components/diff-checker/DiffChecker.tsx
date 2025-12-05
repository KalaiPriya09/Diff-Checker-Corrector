import React, { useMemo, useCallback, useEffect, useLayoutEffect, useState, useRef } from 'react';
import {
  Container,
  MainContent,
  InputSection,
  InputPanelWrapper,
  InputPanel,
  PanelHeader,
  PanelActions,
  TextAreaContainer,
  TextArea,
  PanelFooter,
  ErrorMessage,
  ComparisonSection,
  DiffPanel,
  DiffHeader,
  DiffContent,
  DiffLine,
  DiffLineNumber,
  DiffLineContent,
  WordHighlight,
  SummaryBar,
  SummaryTitle,
  SummaryStats,
  DifferencesBadge,
  StatItem,
  StatLabel,
  StatValue,
  StatusText,
  NoDifferencesMessage,
  OptionsSection,
  OptionsHeader,
  OptionsTitle,
  OptionsContent,
  CommonButtons,
  ActionButton,
  HiddenFileInput,
  ToggleGroup,
  ToggleLabel,
  ToggleSwitch,
  DragOverlay,
  ClearIcon
} from './DiffChecker.styles';
import { useDiffChecker } from '../../hooks/useDiffChecker';
import { DiffLine as DiffLineType } from '../../utils/diffChecker';
import { Button } from '../button';
import { useDragAndDrop } from '../../hooks/useDragAndDrop';
import { UrlModal } from '../UrlModal';
import { Alert } from '../Alert';
import { Loading } from '../Loader/Loading';
import { CustomSelect } from '../CustomSelect';
import { formatBytes } from '../../utils/errorHandling';
import {
  clearSessionData
} from '../../services/sessionStorage';
import { clearAllFormatData } from '../../services/formatStorage';
import type { componentType, FormatType, TextCompareMode } from '../../types/common';

interface DiffCheckerProps {
  activeFormat?: componentType;
  onClearAllRef?: React.MutableRefObject<(() => void) | null>;
}

const DiffChecker: React.FC<DiffCheckerProps> = ({ activeFormat, onClearAllRef }) => {
  // ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURNS
  // Use a safe default to ensure hooks are always called in the same order
  const safeActiveFormat = activeFormat || 'json-compare';

  const {
    leftInput,
    rightInput,
    format,
    mode,
    leftValidation,
    rightValidation,
    diffResult,
    isComparing,
    diffOptions,
    setLeftInput,
    setRightInput,
    setFormat: setHookFormat,
    setMode: setHookMode,
    setDiffOptions,
    compare,
    canCompare,
    clear,
  } = useDiffChecker(safeActiveFormat); // Use safeActiveFormat to ensure hooks are always called

  // Track previous activeFormat to prevent unnecessary syncing
  // Initialize to undefined so useLayoutEffect runs on initial mount
  const prevActiveFormat = useRef<componentType | undefined>(undefined);
  // Use ref to access current diffOptions without causing dependency issues
  const diffOptionsRef = useRef(diffOptions);

  // Update ref when diffOptions changes
  useEffect(() => {
    diffOptionsRef.current = diffOptions;
  }, [diffOptions]);

  // Sync format/mode from parent (Header) when activeFormat changes
  // Use useLayoutEffect to run synchronously before paint to prevent flash
  useLayoutEffect(() => {
    // Skip if activeFormat is undefined
    if (!activeFormat) {
      return;
    }

    // Skip if activeFormat hasn't changed (but allow initial mount)
    if (prevActiveFormat.current !== undefined && activeFormat === prevActiveFormat.current) {
      return;
    }

    prevActiveFormat.current = activeFormat;

    if (activeFormat) {
      let newFormat: FormatType;
      let newMode: 'compare' | 'validate';

      if (activeFormat.includes('-validate')) {
        newFormat = activeFormat.replace('-validate', '') as FormatType;
        newMode = 'validate';
      } else {
        newFormat = activeFormat.replace('-compare', '') as FormatType;
        newMode = 'compare';
      }

      // Always update format and mode first, regardless of current state
      // This ensures the format is updated immediately when switching tabs
      setHookFormat(newFormat);
      setHookMode(newMode);

      // Then disable format-specific options when switching formats
      // Use ref to access current diffOptions to avoid stale closure
      const currentDiffOptions = diffOptionsRef.current;
      const updates: Partial<typeof diffOptions> = {};

      if (newFormat !== 'json') {
        if (currentDiffOptions.ignoreKeyOrder) {
          updates.ignoreKeyOrder = false;
        }
        if (currentDiffOptions.ignoreArrayOrder) {
          updates.ignoreArrayOrder = false;
        }
      }

      if (newFormat !== 'xml' && currentDiffOptions.ignoreAttributeOrder) {
        updates.ignoreAttributeOrder = false;
      }

      if (Object.keys(updates).length > 0) {
        setDiffOptions(updates);
      }
    }
  }, [activeFormat, setHookFormat, setHookMode, setDiffOptions]);

  /**
   * Handle preserve session toggle
   */

  // Clear session storage function for current tab
  const clearSessionStorage = useCallback(() => {
    if (activeFormat) {
      clearSessionData(activeFormat);
    }
  }, [activeFormat]);


  // Modal and Alert state
  const [showUrlModal, setShowUrlModal] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

  // File upload loading states
  const [isUploadingLeft, setIsUploadingLeft] = useState(false);
  const [isUploadingRight, setIsUploadingRight] = useState(false);

  // Show alert helper function
  const showAlertMessage = useCallback((title: string, message: string) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setShowAlert(true);
  }, []);

  const formatSize = useCallback((text: string): string => {
    const bytes = new Blob([text]).size;
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }, []);

  const handleCompare = useCallback(async () => {
    await compare();
  }, [compare]);

  // Reset button handler - only clears current state, not localStorage
  const handleReset = useCallback(() => {
    // Clear state only - localStorage remains intact
    clear();
  }, [clear]);

  // Clear All button handler - clears everything (state + localStorage for all formats)
  const handleClearAll = useCallback(() => {
    // Clear current state
    clear();
    // Clear session storage for current format
    clearSessionStorage();
    // Clear all format data for all tabs (JSON, XML, TEXT compare and validate)
    clearAllFormatData();
  }, [clear, clearSessionStorage]);

  // Expose clear function to parent via ref
  useEffect(() => {
    if (onClearAllRef) {
      onClearAllRef.current = handleClearAll;
    }
    return () => {
      if (onClearAllRef) {
        onClearAllRef.current = null;
      }
    };
  }, [handleClearAll, onClearAllRef]);

  // Check if both inputs are empty to disable Reset button
  const isClearDisabled = useMemo(() => {
    const leftEmpty = !leftInput || leftInput.trim().length === 0;
    const rightEmpty = !rightInput || rightInput.trim().length === 0;
    return leftEmpty && rightEmpty;
  }, [leftInput, rightInput]);

  // Check if copy/download should be disabled for each panel
  const isLeftCopyDisabled = useMemo(() => {
    return !leftInput || leftInput.trim().length === 0;
  }, [leftInput]);

  const isLeftDownloadDisabled = useMemo(() => {
    return !leftInput || leftInput.trim().length === 0;
  }, [leftInput]);

  const isRightCopyDisabled = useMemo(() => {
    return !rightInput || rightInput.trim().length === 0;
  }, [rightInput]);

  const isRightDownloadDisabled = useMemo(() => {
    return !rightInput || rightInput.trim().length === 0;
  }, [rightInput]);

  // File input refs for upload functionality
  const leftFileInputRef = React.useRef<HTMLInputElement>(null);
  const rightFileInputRef = React.useRef<HTMLInputElement>(null);

  // Textarea refs for preserving undo history
  const leftTextareaRef = React.useRef<HTMLTextAreaElement>(null);
  const rightTextareaRef = React.useRef<HTMLTextAreaElement>(null);

  /**
   * Validate file size before processing
   * Returns true if file is valid, false otherwise
   */
  const validateFileSize = useCallback((file: File): boolean => {
    const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB
    if (file.size > MAX_FILE_SIZE) {
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
      showAlertMessage(
        'Content Too Large',
        `Content size: ${fileSizeMB} MB\nMaximum allowed: 2 MB\n\nPlease select a smaller file or compress the content.`
      );
      return false;
    }
    return true;
  }, [showAlertMessage]);

  // Get accepted file extensions based on active tool
  const getAcceptedExtensions = useCallback((): string[] => {
    if (!activeFormat) return ['.json', '.xml', '.txt', '.text'];

    // JSON Compare → only accept .json
    if (activeFormat === 'json-compare') return ['.json'];
    // XML Compare → only accept .xml
    if (activeFormat === 'xml-compare') return ['.xml'];
    // Text Compare → only accept .txt, .text
    if (activeFormat === 'text-compare') return ['.txt', '.text'];
    // JSON Validate → only accept .json
    if (activeFormat === 'json-validate') return ['.json'];
    // XML Validate → only accept .xml
    if (activeFormat === 'xml-validate') return ['.xml'];

    // Fallback to format-based logic
    return format === 'json' ? ['.json'] : format === 'xml' ? ['.xml'] : ['.text', '.txt'];
  }, [activeFormat, format]);

  // Drag and drop handlers for left input
  const leftDragDrop = useDragAndDrop({
    onDrop: useCallback((content: string, file: File) => {
      // Validate file size before processing
      if (file && !validateFileSize(file)) {
        setIsUploadingLeft(false);
        return;
      }
      // Set loading state and process content
      setIsUploadingLeft(true);
      // Use setTimeout to ensure loading state is visible
      setTimeout(() => {
        setLeftInput(content);
        setIsUploadingLeft(false);
      }, 100); // Small delay to ensure loading state is visible
    }, [setLeftInput, validateFileSize]),
    accept: getAcceptedExtensions(),
    maxSize: 2 * 1024 * 1024, // 2 MB
    onError: (error) => {
      setIsUploadingLeft(false);
      showAlertMessage('File Error', error);
    },
  });

  // Wrap drag drop handlers to set loading state immediately on drop
  const leftDragDropHandlers = {
    ...leftDragDrop,
    onDrop: useCallback((e: React.DragEvent<HTMLElement>) => {
      // Set loading state immediately when drop happens
      setIsUploadingLeft(true);
      // Call original onDrop handler - it will handle errors via onError callback
      // onDrop is async and handles errors internally, so we just call it
      const dropPromise = leftDragDrop.onDrop(e) as Promise<void> | void;
      if (dropPromise && typeof dropPromise.catch === 'function') {
        // Prevent unhandled promise rejection warnings
        dropPromise.catch(() => {
          // Silent catch - error is already handled by onError callback in useDragAndDrop
        });
      }
    }, [leftDragDrop]),
  };

  // Drag and drop handlers for right input
  const rightDragDrop = useDragAndDrop({
    onDrop: useCallback((content: string, file: File) => {
      // Validate file size before processing
      if (file && !validateFileSize(file)) {
        setIsUploadingRight(false);
        return;
      }
      // Set loading state and process content
      setIsUploadingRight(true);
      // Use setTimeout to ensure loading state is visible
      setTimeout(() => {
        setRightInput(content);
        setIsUploadingRight(false);
      }, 100); // Small delay to ensure loading state is visible
    }, [setRightInput, validateFileSize]),
    accept: getAcceptedExtensions(),
    maxSize: 2 * 1024 * 1024, // 2 MB
    onError: (error) => {
      setIsUploadingRight(false);
      showAlertMessage('File Error', error);
    },
  });

  // Wrap drag drop handlers to set loading state immediately on drop
  const rightDragDropHandlers = {
    ...rightDragDrop,
    onDrop: useCallback((e: React.DragEvent<HTMLElement>) => {
      // Set loading state immediately when drop happens
      setIsUploadingRight(true);
      // Call original onDrop handler - it will handle errors via onError callback
      // onDrop is async and handles errors internally, so we just call it
      const dropPromise = rightDragDrop.onDrop(e) as Promise<void> | void;
      if (dropPromise && typeof dropPromise.catch === 'function') {
        // Prevent unhandled promise rejection warnings
        dropPromise.catch(() => {
          // Silent catch - error is already handled by onError callback in useDragAndDrop
        });
      }
    }, [rightDragDrop]),
  }; 

  const renderDiffLine = useCallback((line: DiffLineType) => {
    const isWordMode = format === 'text' && diffOptions.textCompareMode === 'word' && !!line.words;

    return (
      <DiffLine key={`${line.lineNumber}-${line.type}`} type={line.type} $isWordMode={isWordMode}>
        <DiffLineNumber type={line.type}>{line.lineNumber}</DiffLineNumber>
        <DiffLineContent type={line.type}>
          {isWordMode ? (
            <>
              {line.words!.map((wordDiff, wordIdx) => {
                // Check if this word is whitespace-only (for ignoreWhitespace: false mode)
                const isWhitespace = /^\s+$/.test(wordDiff.word);
                // For whitespace-only words, don't apply highlighting
                if (isWhitespace) {
                  return <React.Fragment key={wordIdx}>{wordDiff.word}</React.Fragment>;
                }
                // Map 'changed' to 'modified' for WordHighlight component
                const highlightType = wordDiff.type === 'changed' ? 'modified' : wordDiff.type;
                // Only allow valid types for WordHighlight
                if (highlightType !== 'added' && highlightType !== 'removed' && highlightType !== 'modified' && highlightType !== 'unchanged') {
                  return <React.Fragment key={wordIdx}>{wordDiff.word}</React.Fragment>;
                }
                return (
                  <React.Fragment key={wordIdx}>
                    <WordHighlight $type={highlightType as 'added' | 'removed' | 'unchanged' | 'modified'}>
                      {wordDiff.word}
                    </WordHighlight>
                    {/* Add space only if ignoreWhitespace is true and next word exists and doesn't start with whitespace */}
                    {diffOptions.ignoreWhitespace &&
                      wordIdx < line.words!.length - 1 &&
                      !line.words![wordIdx + 1].word.match(/^\s/) && ' '}
                  </React.Fragment>
                );
              })}
            </>
          ) : (
            line.content || ' '
          )}
        </DiffLineContent>
      </DiffLine>
    );
  }, [format, diffOptions.textCompareMode, diffOptions.ignoreWhitespace]);

  const getStatistics = useCallback(() => {
    if (!diffResult) return null;

    // In Word Mode, count words instead of lines
    if (format === 'text' && diffOptions.textCompareMode === 'word') {
      let added = 0;
      let removed = 0;
      let modified = 0;

      // Count words in left lines
      for (const line of diffResult.leftLines) {
        if (line.words) {
          for (const word of line.words) {
            if (word.type === 'removed') {
              removed++;
            } else if (word.type === 'changed') {
              modified++;
            }
          }
        }
      }

      // Count words in right lines
      for (const line of diffResult.rightLines) {
        if (line.words) {
          for (const word of line.words) {
            if (word.type === 'added') {
              added++;
            }
            // Modified words are already counted from left, so we don't double count
          }
        }
      }

      return { added, removed, changed: modified, unchanged: 0 };
    }

    // Line mode - count lines as before
    const added = diffResult.rightLines.filter((l) => l.type === 'added').length;
    const removed = diffResult.leftLines.filter((l) => l.type === 'removed').length;
    const changed = diffResult.leftLines.filter((l) => l.type === 'changed').length;
    const unchanged = diffResult.leftLines.filter((l) => l.type === 'unchanged').length;

    return { added, removed, changed, unchanged };
  }, [diffResult, format, diffOptions.textCompareMode]);

  const stats = useMemo(() => getStatistics(), [getStatistics]);
  const isValidationMode = mode === 'validate';
  const totalDifferences = stats ? stats.added + stats.removed + stats.changed : 0;

  const formatStatValue = (value: number, type: 'added' | 'removed' | 'changed') => {
    if (type === 'added') return `+${value}`;
    if (type === 'removed') return `-${value}`;
    if (type === 'changed') return `~${value}`;
    return value;
  };

  // Copy functionality for specific panel
  const handleCopy = useCallback(async (panel: 'left' | 'right') => {
    try {
      const textToCopy = panel === 'left' ? leftInput : rightInput;

      if (!textToCopy.trim()) {
        return;
      }

      await navigator.clipboard.writeText(textToCopy);
      // You could add a toast notification here if needed
    } catch {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = panel === 'left' ? leftInput : rightInput;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  }, [leftInput, rightInput]);

  // Upload functionality for specific panel
  const handleUpload = useCallback((panel: 'left' | 'right') => {
    if (panel === 'left') {
      leftFileInputRef.current?.click();
    } else {
      rightFileInputRef.current?.click();
    }
  }, []);

  // Handle file upload
  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>, target: 'left' | 'right') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size first (2MB limit)
    if (!validateFileSize(file)) {
      e.target.value = '';
      return;
    }

    // Validate file extension based on current format
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    let allowedExtensions: string[] = [];
    let formatName = '';

    if (format === 'json') {
      allowedExtensions = ['json'];
      formatName = 'JSON';
    } else if (format === 'xml') {
      allowedExtensions = ['xml'];
      formatName = 'XML';
    } else if (format === 'text') {
      allowedExtensions = ['text', 'txt'];
      formatName = 'Text';
    }

    if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
      showAlertMessage(
        'Invalid File Type',
        `Only ${formatName} files (${allowedExtensions.map(ext => `.${ext}`).join(', ')}) are allowed for ${formatName} format.`
      );
      e.target.value = '';
      return;
    }

    // Set loading state
    if (target === 'left') {
      setIsUploadingLeft(true);
    } else {
      setIsUploadingRight(true);
    }

    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        // Add small delay to ensure loading state is visible
        setTimeout(() => {
          if (target === 'left') {
            setLeftInput(content);
            setIsUploadingLeft(false);
          } else {
            setRightInput(content);
            setIsUploadingRight(false);
          }
        }, 100);
      };
      reader.onerror = () => {
        if (target === 'left') {
          setIsUploadingLeft(false);
        } else {
          setIsUploadingRight(false);
        }
        showAlertMessage('Error Reading File', 'Failed to read the file. Please try again.');
      };
      reader.readAsText(file);
    } catch {
      if (target === 'left') {
        setIsUploadingLeft(false);
      } else {
        setIsUploadingRight(false);
      }
      showAlertMessage('Error Uploading File', 'An error occurred while uploading the file.');
    }

    // Reset input value to allow selecting the same file again
    e.target.value = '';
  }, [format, setLeftInput, setRightInput, showAlertMessage, validateFileSize]);

  // Download functionality for specific panel
  const handleDownload = useCallback((panel: 'left' | 'right') => {
    try {
      const content = panel === 'left' ? leftInput : rightInput;
      const panelName = panel === 'left' ? 'left' : 'right';
      const filename = `${panelName}-content.${format === 'json' ? 'json' : format === 'xml' ? 'xml' : 'txt'}`;

      if (!content.trim()) {
        return;
      }

      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {
      showAlertMessage('Error Downloading File', 'Failed to download the file. Please try again.');
    }
  }, [leftInput, rightInput, format, showAlertMessage]);

  // Load URL functionality - opens modal
  const handleLoadURLClick = useCallback(() => {
    setShowUrlModal(true);
  }, []);

  // Load URL from modal
  const handleLoadURL = useCallback(async (url: string) => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const content = await response.text();

      // Validate content size (2MB limit)
      const contentSize = new TextEncoder().encode(content).length;
      const MAX_SIZE = 2 * 1024 * 1024; // 2 MB

      if (contentSize > MAX_SIZE) {
        const sizeMB = formatBytes(contentSize);
        throw new Error(`Content size is ${sizeMB}. Maximum allowed size is 2 MB.`);
      }

      // Load into left panel
      setLeftInput(content);

      // In compare mode, also load into right panel
      if (!isValidationMode) {
        setRightInput(content);
      }
    } catch (error) {
      showAlertMessage(
        'Error Loading URL',
        error instanceof Error ? error.message : 'Unknown error occurred while loading URL.'
      );
      throw error; // Re-throw to let modal handle it
    }
  }, [setLeftInput, setRightInput, isValidationMode, showAlertMessage]);

  // Sample data functionality - works on both panels in compare mode, left panel in validate mode
  const handleSample = useCallback(() => {
    let sampleData = '';

    if (format === 'json') {
      sampleData = JSON.stringify({
        name: 'Sample JSON',
        version: '1.0.0',
        description: 'This is a sample JSON object',
        data: {
          items: ['item1', 'item2', 'item3'],
          count: 3,
          active: true
        },
        metadata: {
          created: new Date().toISOString(),
          tags: ['sample', 'example']
        }
      }, null, 2);
    } else if (format === 'xml') {
      sampleData = `<?xml version="1.0" encoding="UTF-8"?>
<root>
  <name>Sample XML</name>
  <version>1.0.0</version>
  <description>This is a sample XML document</description>
  <data>
    <items>
      <item>item1</item>
      <item>item2</item>
      <item>item3</item>
    </items>
    <count>3</count>
    <active>true</active>
  </data>
  <metadata>
    <created>${new Date().toISOString()}</created>
    <tags>
      <tag>sample</tag>
      <tag>example</tag>
    </tags>
  </metadata>
</root>`;
    } else {
      sampleData = `Sample Text Content
==================

This is a sample text document.
You can use this as a starting point for your text comparison.

Features:
- Line by line comparison
- Case sensitive option
- Whitespace handling

Created: ${new Date().toLocaleString()}`;
    }

    // Load sample into left panel
    setLeftInput(sampleData);

    // In compare mode, also load into right panel
    if (!isValidationMode) {
      setRightInput(sampleData);
    }
  }, [format, isValidationMode, setLeftInput, setRightInput]);

  // Get sample URL based on format
  const getSampleUrl = useCallback(() => {
    if (format === 'json') {
      return 'https://gist.githubusercontent.com/cbmgit/852c2702d4342e7811c95f8ffc2f017f/raw/InsuranceCompanies.json';
    } else if (format === 'xml') {
      return 'https://gist.githubusercontent.com/cbmgit/852c2e549f35e1a73e9410259d8b87e5/raw/852c2e549f35e1a73e9410259d8b87e5.xml';
    }
    return 'https://example.com/data.txt';
  }, [format]);


  // Get display name for the selected componentType
  const getComponentTypeDisplayName = useCallback((componentType?: componentType): string => {
    if (!componentType) return isValidationMode ? 'Validation Options' : 'Comparison Options';

    const formatMap: Record<componentType, string> = {
      'json-compare': 'JSON Compare',
      'xml-compare': 'XML Compare',
      'text-compare': 'Text Compare',
      'json-validate': 'JSON Validate',
      'xml-validate': 'XML Validate',
    };

    return formatMap[componentType] || (isValidationMode ? 'Validation Options' : 'Comparison Options');
  }, [isValidationMode]);

  const leftError = leftValidation && !leftValidation.isValid ? leftValidation.error : null;
  const rightError = rightValidation && !rightValidation.isValid ? rightValidation.error : null;
  const leftSuccess = leftValidation?.isValid || false;
  const rightSuccess = rightValidation?.isValid || false;


  // Early return check AFTER all hooks (React Rules of Hooks requirement)
  if (!activeFormat) {
    return null;
  }

  return (
    <>
      <UrlModal
        show={showUrlModal}
        onClose={() => setShowUrlModal(false)}
        onLoad={handleLoadURL}
        title="Load URL"
        sampleUrl={getSampleUrl()}
        viewType={activeFormat}
      />
      <Alert
        show={showAlert}
        title={alertTitle}
        message={alertMessage}
        onClose={() => setShowAlert(false)}
      />
      <Container>
        <MainContent>
          {!isValidationMode && (
            <OptionsSection>
              <OptionsHeader>
                <OptionsTitle>{getComponentTypeDisplayName(activeFormat)}</OptionsTitle>
                <CommonButtons>
                  {format !== 'text' && format !== 'xml' && (
                    <ActionButton onClick={handleLoadURLClick} title="Load content from URL">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                        <polyline points="15 3 21 3 21 9"></polyline>
                        <line x1="10" y1="14" x2="21" y2="3"></line>
                      </svg>
                      <span>Load URL</span>
                    </ActionButton>
                  )}
                  <ActionButton onClick={handleSample} title="Load sample data">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                      <line x1="16" y1="13" x2="8" y2="13"></line>
                      <line x1="16" y1="17" x2="8" y2="17"></line>
                      <polyline points="10 9 9 9 8 9"></polyline>
                    </svg>
                    <span>Sample</span>
                  </ActionButton>
                  {/* this Semantic is for feature purpose
                {!isValidationMode && (
                  <ToggleLabel>
                    <ToggleSwitch
                      checked={isSemantic}
                      onChange={(e) => setIsSemantic(e.target.checked)}
                    />
                    <span>Semantic</span>
                  </ToggleLabel>
                )} */}
                  <Button
                    onClick={handleCompare}
                    disabled={!canCompare || isComparing}
                    variant="primary"
                  >
                    {isValidationMode ? 'Validate' : 'Compare'}
                  </Button>
                  <Button
                    onClick={handleReset}
                    variant="primary"
                    disabled={isClearDisabled}
                  >
                    <ClearIcon>↻</ClearIcon>
                    <span>Reset</span>
                  </Button>
                </CommonButtons>
              </OptionsHeader>
              <OptionsContent>
                <ToggleGroup>
                  <ToggleLabel>
                    <ToggleSwitch
                      checked={diffOptions.ignoreWhitespace}
                      onChange={(e) =>
                        setDiffOptions({ ignoreWhitespace: e.target.checked })
                      }
                    />
                    <span>Ignore Whitespace</span>
                  </ToggleLabel>
                  <ToggleLabel>
                    <ToggleSwitch
                      checked={diffOptions.caseSensitive}
                      onChange={(e) =>
                        setDiffOptions({ caseSensitive: e.target.checked })
                      }
                    />
                    <span>Case Sensitive</span>
                  </ToggleLabel>
                  {format === 'text' && (
                    <ToggleLabel style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span>Compare Mode:</span>
                      <CustomSelect
                        value={diffOptions.textCompareMode || 'line'}
                        options={[
                          { value: 'line', label: 'Line Mode' },
                          { value: 'word', label: 'Word Mode' },
                        ]}
                        onChange={(value) => {
                          const mode = value as TextCompareMode;
                          setDiffOptions({ textCompareMode: mode });
                        }}
                      />
                    </ToggleLabel>
                  )}
                  {format === 'json' && (
                    <>
                      <ToggleLabel>
                        <ToggleSwitch
                          checked={diffOptions.ignoreKeyOrder}
                          onChange={(e) =>
                            setDiffOptions({ ignoreKeyOrder: e.target.checked })
                          }
                        />
                        <span>Ignore Key Order</span>
                      </ToggleLabel>
                      <ToggleLabel>
                        <ToggleSwitch
                          checked={diffOptions.ignoreArrayOrder}
                          onChange={(e) =>
                            setDiffOptions({ ignoreArrayOrder: e.target.checked })
                          }
                        />
                        <span>Ignore Array Order</span>
                      </ToggleLabel>
                    </>
                  )}
                  {format === 'xml' && (
                    <ToggleLabel>
                      <ToggleSwitch
                        checked={diffOptions.ignoreAttributeOrder}
                        onChange={(e) =>
                          setDiffOptions({ ignoreAttributeOrder: e.target.checked })
                        }
                      />
                      <span>Ignore Attribute Order</span>
                    </ToggleLabel>
                  )}
                </ToggleGroup>
              </OptionsContent>
            </OptionsSection>
          )}
          {isValidationMode && (
            <OptionsSection>
              <OptionsHeader>
                <OptionsTitle>{getComponentTypeDisplayName(activeFormat)}</OptionsTitle>
                <CommonButtons>
                  {format !== 'text' && format !== 'xml' && (
                    <ActionButton onClick={handleLoadURLClick} title="Load content from URL">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                        <polyline points="15 3 21 3 21 9"></polyline>
                        <line x1="10" y1="14" x2="21" y2="3"></line>
                      </svg>
                      <span>Load URL</span>
                    </ActionButton>
                  )}
                  <ActionButton onClick={handleSample} title="Load sample data">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                      <line x1="16" y1="13" x2="8" y2="13"></line>
                      <line x1="16" y1="17" x2="8" y2="17"></line>
                      <polyline points="10 9 9 9 8 9"></polyline>
                    </svg>
                    <span>Sample</span>
                  </ActionButton>
                  <Button
                    onClick={handleCompare}
                    disabled={!canCompare || isComparing}
                    variant="primary"
                  >
                    Validate
                  </Button>
                  <Button
                    onClick={handleReset}
                    variant="primary"
                    disabled={isClearDisabled}
                  >
                    <ClearIcon>↻</ClearIcon>
                    <span>Reset</span>
                  </Button>
                </CommonButtons>
              </OptionsHeader>
            </OptionsSection>
          )}
          <HiddenFileInput
            ref={leftFileInputRef}
            type="file"
            accept={getAcceptedExtensions().join(',')}
            onChange={(e) => handleFileChange(e, 'left')}
          />
          {!isValidationMode && (
            <HiddenFileInput
              ref={rightFileInputRef}
              type="file"
              accept={getAcceptedExtensions().join(',')}
              onChange={(e) => handleFileChange(e, 'right')}
            />
          )}
          <InputSection>
            <InputPanelWrapper>
              <InputPanel
                $isDragOver={leftDragDropHandlers.isDragOver}
                onDragEnter={leftDragDropHandlers.onDragEnter}
                onDragOver={leftDragDropHandlers.onDragOver}
                onDragLeave={leftDragDropHandlers.onDragLeave}
                onDrop={leftDragDropHandlers.onDrop}
              >
                {leftDragDropHandlers.isDragOver && (
                  <DragOverlay>
                    <div>Drop file here to load content</div>
                  </DragOverlay>
                )}
                <PanelHeader>
                  <span>{isValidationMode ? 'Input Content' : 'LEFT'}</span>
                  <PanelActions>
                    <ActionButton onClick={() => handleUpload('left')} title="Upload file">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="17 8 12 3 7 8"></polyline>
                        <line x1="12" y1="3" x2="12" y2="15"></line>
                      </svg>
                      <span>Upload</span>
                    </ActionButton>
                    <ActionButton
                      onClick={() => handleCopy('left')}
                      title="Copy content to clipboard"
                      disabled={isLeftCopyDisabled}
                      aria-label="Copy left panel content to clipboard"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                      </svg>
                      <span>Copy</span>
                    </ActionButton>
                    <ActionButton
                      onClick={() => handleDownload('left')}
                      title="Download content"
                      disabled={isLeftDownloadDisabled}
                      aria-label="Download left panel content"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                      </svg>
                      <span>Download</span>
                    </ActionButton>
                  </PanelActions>
                </PanelHeader>
                <TextAreaContainer>
                  {isUploadingLeft && (
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 10 }}>
                      <Loading />
                    </div>
                  )}
                  <TextArea
                    ref={leftTextareaRef}
                    value={leftInput}
                    onChange={(e) => setLeftInput(e.target.value)}
                    placeholder="Paste your content here... (or drag and drop a file)"
                    spellCheck={false}
                    style={{ opacity: isUploadingLeft ? 0.5 : 1 }}
                  />
                </TextAreaContainer>
                <PanelFooter>
                  <span>Size: {formatSize(leftInput)}</span>
                  {leftError && <StatusText type="error">Error</StatusText>}
                  {leftSuccess && <StatusText type="success">Valid</StatusText>}
                </PanelFooter>
              </InputPanel>
              {leftError && <ErrorMessage>{leftError}</ErrorMessage>}
              {/* {leftSuccess && <SuccessMessage>Valid</SuccessMessage>} */}
            </InputPanelWrapper>
            {!isValidationMode && (
              <InputPanelWrapper>
                <InputPanel
                  $isDragOver={rightDragDropHandlers.isDragOver}
                  onDragEnter={rightDragDropHandlers.onDragEnter}
                  onDragOver={rightDragDropHandlers.onDragOver}
                  onDragLeave={rightDragDropHandlers.onDragLeave}
                  onDrop={rightDragDropHandlers.onDrop}
                >
                  {rightDragDropHandlers.isDragOver && (
                    <DragOverlay>
                      <div>Drop file here to load content</div>
                    </DragOverlay>
                  )}
                  <PanelHeader>
                    <span>RIGHT</span>
                    <PanelActions>
                      <ActionButton onClick={() => handleUpload('right')} title="Upload file">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                          <polyline points="17 8 12 3 7 8"></polyline>
                          <line x1="12" y1="3" x2="12" y2="15"></line>
                        </svg>
                        <span>Upload</span>
                      </ActionButton>
                      <ActionButton
                        onClick={() => handleCopy('right')}
                        title="Copy content to clipboard"
                        disabled={isRightCopyDisabled}
                        aria-label="Copy right panel content to clipboard"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>
                        <span>Copy</span>
                      </ActionButton>
                      <ActionButton
                        onClick={() => handleDownload('right')}
                        title="Download content"
                        disabled={isRightDownloadDisabled}
                        aria-label="Download right panel content"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                          <polyline points="7 10 12 15 17 10"></polyline>
                          <line x1="12" y1="15" x2="12" y2="3"></line>
                        </svg>
                        <span>Download</span>
                      </ActionButton>
                    </PanelActions>
                  </PanelHeader>
                  <TextAreaContainer>
                    {isUploadingRight && (
                      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 10 }}>
                        <Loading />
                      </div>
                    )}
                    <TextArea
                      ref={rightTextareaRef}
                      value={rightInput}
                      onChange={(e) => setRightInput(e.target.value)}
                      placeholder="Paste your content here... (or drag and drop a file)"
                      spellCheck={false}
                      style={{ opacity: isUploadingRight ? 0.5 : 1 }}
                    />
                  </TextAreaContainer>
                  <PanelFooter>
                    <span>Size: {formatSize(rightInput)}</span>
                    {rightError && <StatusText type="error">Error</StatusText>}
                    {rightSuccess && <StatusText type="success">Valid</StatusText>}
                  </PanelFooter>
                </InputPanel>
                {rightError && <ErrorMessage>{rightError}</ErrorMessage>}
                {/* {rightSuccess && <SuccessMessage>Valid</SuccessMessage>} */}
              </InputPanelWrapper>
            )}
          </InputSection>

          {isValidationMode && leftSuccess && leftInput.trim() && (
            <NoDifferencesMessage>
              Valid {format === 'json' ? 'JSON' : format === 'xml' ? 'XML' : 'Text'} - The content is valid and properly formatted.
            </NoDifferencesMessage>
          )}
          {!isValidationMode && diffResult && (
            <>
              {!diffResult.hasChanges ? (
                <NoDifferencesMessage>
                  No Differences Found - The {format === 'json' ? 'JSON' : format === 'xml' ? 'XML' : 'text'} objects are identical.
                </NoDifferencesMessage>
              ) : (
                <>
                  <SummaryBar>
                    <SummaryTitle>Comparison Results</SummaryTitle>
                    <SummaryStats>
                      <DifferencesBadge>
                        {totalDifferences} difference{totalDifferences !== 1 ? 's' : ''} found
                      </DifferencesBadge>
                      <StatItem>
                        <StatLabel>ADDED</StatLabel>
                        <StatValue type="added">{formatStatValue(stats?.added || 0, 'added')}</StatValue>
                      </StatItem>
                      <StatItem>
                        <StatLabel>REMOVED</StatLabel>
                        <StatValue type="removed">{formatStatValue(stats?.removed || 0, 'removed')}</StatValue>
                      </StatItem>
                      <StatItem>
                        <StatLabel>CHANGED</StatLabel>
                        <StatValue type="changed">{formatStatValue(stats?.changed || 0, 'changed')}</StatValue>
                      </StatItem>
                    </SummaryStats>
                  </SummaryBar>
                  <ComparisonSection>
                    <DiffPanel>
                      <DiffHeader>Left</DiffHeader>
                      <DiffContent>
                        {diffResult.leftLines.map(renderDiffLine)}
                      </DiffContent>
                    </DiffPanel>
                    <DiffPanel>
                      <DiffHeader>Right</DiffHeader>
                      <DiffContent>
                        {diffResult.rightLines.map(renderDiffLine)}
                      </DiffContent>
                    </DiffPanel>
                  </ComparisonSection>
                </>
              )}
            </>
          )}
        </MainContent>
      </Container>
      {isComparing && (
        <Loading message={isValidationMode ? 'Validating...' : 'Comparing...'} />
      )}
    </>
  );
};

export default DiffChecker;

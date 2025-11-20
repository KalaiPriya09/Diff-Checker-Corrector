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
  clearSessionData, 
  setSessionPreserveEnabled 
} from '../../services/sessionStorage';
import type { componentType, FormatType, TextCompareMode } from '../../types/common';

interface DiffCheckerProps {
  activeFormat?: componentType;
  onClearAllRef?: React.MutableRefObject<(() => void) | null>;
}

const DiffChecker: React.FC<DiffCheckerProps> = ({ activeFormat, onClearAllRef }) => {
  // Ensure activeFormat is defined before using it
  if (!activeFormat) {
    return null;
  }

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
    preserveSession,
    setLeftInput,
    setRightInput,
    setFormat: setHookFormat,
    setMode: setHookMode,
    setDiffOptions,
    compare,
    canCompare,
    clear,
    togglePreserveSession,
  } = useDiffChecker(activeFormat); // Pass activeFormat as tabId for tab isolation

  // Track previous activeFormat to prevent unnecessary syncing
  const prevActiveFormat = useRef<componentType | undefined>(activeFormat);

  // Sync format/mode from parent (Header) when activeFormat changes
  // Use useLayoutEffect to run synchronously before paint to prevent flash
  useLayoutEffect(() => {
    // Skip if activeFormat is undefined or hasn't changed
    if (!activeFormat || activeFormat === prevActiveFormat.current) {
      return;
    }
    
    prevActiveFormat.current = activeFormat;

    if (activeFormat) {
      if (activeFormat.includes('-validate')) {
        const newFormat = activeFormat.replace('-validate', '') as FormatType;
        
        // Disable format-specific options when switching formats
        if (newFormat !== 'json') {
          const updates: Partial<typeof diffOptions> = {};
          if (diffOptions.ignoreKeyOrder) {
            updates.ignoreKeyOrder = false;
          }
          if (diffOptions.ignoreArrayOrder) {
            updates.ignoreArrayOrder = false;
          }
          if (Object.keys(updates).length > 0) {
            setDiffOptions(updates);
          }
        }
        if (newFormat !== 'xml' && diffOptions.ignoreAttributeOrder) {
          setDiffOptions({ ignoreAttributeOrder: false });
        }
        
        setHookFormat(newFormat);
        setHookMode('validate');
      } else {
        const newFormat = activeFormat.replace('-compare', '') as FormatType;
        
        // Disable format-specific options when switching formats
        if (newFormat !== 'json') {
          const updates: Partial<typeof diffOptions> = {};
          if (diffOptions.ignoreKeyOrder) {
            updates.ignoreKeyOrder = false;
          }
          if (diffOptions.ignoreArrayOrder) {
            updates.ignoreArrayOrder = false;
          }
          if (Object.keys(updates).length > 0) {
            setDiffOptions(updates);
          }
        }
        if (newFormat !== 'xml' && diffOptions.ignoreAttributeOrder) {
          setDiffOptions({ ignoreAttributeOrder: false });
        }
        
        setHookFormat(newFormat);
        setHookMode('compare');
      }
    }
  }, [activeFormat, setHookFormat, setHookMode, diffOptions.ignoreKeyOrder, diffOptions.ignoreArrayOrder, diffOptions.ignoreAttributeOrder, setDiffOptions]);

  /**
   * Handle preserve session toggle
   */
  const handlePreserveSessionChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const enabled = e.target.checked;
    togglePreserveSession(enabled);
    setSessionPreserveEnabled(enabled);
    
    if (!enabled) {
      // Clear saved data for this tab when disabling
      clearSessionData(activeFormat);
    }
  }, [togglePreserveSession, activeFormat]);

  // Clear session storage function for current tab
  const clearSessionStorage = useCallback(() => {
    clearSessionData(activeFormat);
  }, [activeFormat]);


  // Modal and Alert state
  const [showUrlModal, setShowUrlModal] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  
  // Prettier loading state
  const [isPrettifying, setIsPrettifying] = useState(false);

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

  const handleClearAll = useCallback(() => {
    // Clear inputs
    clear();
    // Clear session storage for current format
    clearSessionStorage();
  }, [clear, clearSessionStorage]);

  // Expose clear function to parent via ref
  useEffect(() => {
    if (onClearAllRef) {
      onClearAllRef.current = () => {
        clear();
        clearSessionStorage();
      };
    }
    return () => {
      if (onClearAllRef) {
        onClearAllRef.current = null;
      }
    };
  }, [clear, clearSessionStorage, onClearAllRef]);

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
        'File Too Large',
        `File size: ${fileSizeMB} MB\nMaximum allowed: 2 MB\n\nPlease select a smaller file or compress the content.`
      );
      return false;
    }
    return true;
  }, [showAlertMessage]);

  /**
   * Validate clipboard content size
   * Returns true if content is valid, false otherwise
   */
  const validateClipboardSize = useCallback((text: string): boolean => {
    const textSize = new TextEncoder().encode(text).length;
    const maxSize = 2 * 1024 * 1024; // 2 MB
    
    if (textSize > maxSize) {
      const sizeMB = (textSize / (1024 * 1024)).toFixed(2);
      showAlertMessage(
        'Clipboard Content Too Large',
        `Content size: ${sizeMB} MB\nMaximum allowed: 2 MB\n\nPlease paste smaller content or use file upload with compression.`
      );
      return false;
    }
    return true;
  }, [showAlertMessage]);

  // Drag and drop handlers for left input
  const leftDragDrop = useDragAndDrop({
    onDrop: useCallback((content: string, file: File) => {
      // Validate file size before processing
      if (file && !validateFileSize(file)) {
        return;
      }
      setLeftInput(content);
    }, [setLeftInput, validateFileSize]),
    accept: format === 'json' ? ['.json'] : format === 'xml' ? ['.xml'] : ['.text', '.txt'],
    maxSize: 2 * 1024 * 1024, // 2 MB
    onError: (error) => {
      showAlertMessage('File Error', error);
    },
  });

  // Drag and drop handlers for right input
  const rightDragDrop = useDragAndDrop({
    onDrop: useCallback((content: string, file: File) => {
      // Validate file size before processing
      if (file && !validateFileSize(file)) {
        return;
      }
      setRightInput(content);
    }, [setRightInput, validateFileSize]),
    accept: format === 'json' ? ['.json'] : format === 'xml' ? ['.xml'] : ['.text', '.txt'],
    maxSize: 2 * 1024 * 1024, // 2 MB
    onError: (error) => {
      showAlertMessage('File Error', error);
    },
  });

  const renderDiffLine = useCallback((line: DiffLineType) => {
    const isWordMode = format === 'text' && diffOptions.textCompareMode === 'word' && !!line.words;
    
    return (
      <DiffLine key={`${line.lineNumber}-${line.type}`} type={line.type} $isWordMode={isWordMode}>
        <DiffLineNumber>{line.lineNumber}</DiffLineNumber>
        <DiffLineContent>
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

  // Check if Prettier button should be disabled
  const isPrettierDisabled = useMemo(() => {
    // Disable if prettifying is in progress
    if (isPrettifying) {
      return true;
    }
    // In validation mode, need left input
    if (isValidationMode) {
      return !leftInput || leftInput.trim().length === 0;
    }
    // In compare mode, need at least left input (it formats both panels)
    return !leftInput || leftInput.trim().length === 0;
  }, [leftInput, isValidationMode, isPrettifying]);

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

    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (target === 'left') {
          setLeftInput(content);
        } else {
          setRightInput(content);
        }
      };
      reader.onerror = () => {
        showAlertMessage('Error Reading File', 'Failed to read the file. Please try again.');
      };
      reader.readAsText(file);
    } catch {
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

  // Prettier/Format functionality - works on both panels in compare mode, left panel in validate mode
  const handlePrettier = useCallback(async () => {
    setIsPrettifying(true);
    try {
      // Add a small delay to show loading state for better UX
      await new Promise((resolve) => setTimeout(resolve, 100));
      let leftFormatted = '';
      let rightFormatted = '';

      if (format === 'json') {
        // Format JSON
        if (leftInput.trim()) {
          try {
            const parsed = JSON.parse(leftInput);
            leftFormatted = JSON.stringify(parsed, null, 2);
          } catch {
            leftFormatted = leftInput; // Keep original if parsing fails
          }
        }
        if (!isValidationMode && rightInput.trim()) {
          try {
            const parsed = JSON.parse(rightInput);
            rightFormatted = JSON.stringify(parsed, null, 2);
          } catch {
            rightFormatted = rightInput; // Keep original if parsing fails
          }
        }
      } else if (format === 'xml') {
        // Format XML - basic formatting
        if (leftInput.trim()) {
          try {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(leftInput, 'text/xml');
            if (xmlDoc.documentElement.nodeName === 'parsererror') {
              leftFormatted = leftInput;
            } else {
              const serializer = new XMLSerializer();
              let formatted = serializer.serializeToString(xmlDoc);
              // Basic indentation
              formatted = formatted.replace(/></g, '>\n<');
              leftFormatted = formatted;
            }
          } catch {
            leftFormatted = leftInput;
          }
        }
        if (!isValidationMode && rightInput.trim()) {
          try {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(rightInput, 'text/xml');
            if (xmlDoc.documentElement.nodeName === 'parsererror') {
              rightFormatted = rightInput;
            } else {
              const serializer = new XMLSerializer();
              let formatted = serializer.serializeToString(xmlDoc);
              formatted = formatted.replace(/></g, '>\n<');
              rightFormatted = formatted;
            }
          } catch {
            rightFormatted = rightInput;
          }
        }
      } else {
        // Text format - just use as is
        leftFormatted = leftInput;
        if (!isValidationMode) {
          rightFormatted = rightInput;
        }
      }

      // Validate formatted content size (2MB limit per panel)
      const MAX_SIZE = 2 * 1024 * 1024; // 2 MB
      
      if (leftFormatted) {
        const leftSize = new TextEncoder().encode(leftFormatted).length;
        if (leftSize > MAX_SIZE) {
          const sizeMB = formatBytes(leftSize);
          showAlertMessage(
            'File Size Exceeded',
            `The formatted content size for left panel is ${sizeMB}. Maximum allowed size is 2 MB per panel.`
          );
          return;
        }
      }
      
      if (!isValidationMode && rightFormatted) {
        const rightSize = new TextEncoder().encode(rightFormatted).length;
        if (rightSize > MAX_SIZE) {
          const sizeMB = formatBytes(rightSize);
          showAlertMessage(
            'File Size Exceeded',
            `The formatted content size for right panel is ${sizeMB}. Maximum allowed size is 2 MB per panel.`
          );
          return;
        }
      }

      // Apply formatting only if size is within limit
      // Use native textarea API to preserve undo history
      if (leftFormatted && leftTextareaRef.current) {
        const textarea = leftTextareaRef.current;
        textarea.focus();
        
        // Select all text first
        textarea.setSelectionRange(0, textarea.value.length);
        
        // Use execCommand('insertText') to preserve undo history
        // This simulates user input and maintains the browser's undo stack
        try {
          if (document.execCommand && document.execCommand('insertText', false, leftFormatted)) {
            // Success - undo history preserved via execCommand
            // Sync React state after a brief delay to ensure the textarea value is updated
            setTimeout(() => {
              setLeftInput(textarea.value);
            }, 0);
          } else {
            // Fallback: manually replace text and create InputEvent
            const start = 0;
            const end = textarea.value.length;
            textarea.setRangeText(leftFormatted, start, end, 'end');
            
            // Create an InputEvent to preserve undo history
            const inputEvent = new InputEvent('input', {
              bubbles: true,
              cancelable: true,
              inputType: 'insertReplacementText',
              data: leftFormatted,
            });
            textarea.dispatchEvent(inputEvent);
            setLeftInput(leftFormatted);
          }
        } catch {
          // If execCommand fails, use setRangeText with InputEvent
          textarea.setRangeText(leftFormatted, 0, textarea.value.length, 'end');
          const inputEvent = new InputEvent('input', {
            bubbles: true,
            cancelable: true,
            inputType: 'insertReplacementText',
            data: leftFormatted,
          });
          textarea.dispatchEvent(inputEvent);
          setLeftInput(leftFormatted);
        }
      }
      
      if (!isValidationMode && rightFormatted && rightTextareaRef.current) {
        const textarea = rightTextareaRef.current;
        textarea.focus();
        
        // Select all text first
        textarea.setSelectionRange(0, textarea.value.length);
        
        // Use execCommand('insertText') to preserve undo history
        try {
          if (document.execCommand && document.execCommand('insertText', false, rightFormatted)) {
            // Success - undo history preserved via execCommand
            // Sync React state after a brief delay to ensure the textarea value is updated
            setTimeout(() => {
              setRightInput(textarea.value);
            }, 0);
          } else {
            // Fallback: manually replace text and create InputEvent
            textarea.setRangeText(rightFormatted, 0, textarea.value.length, 'end');
            
            // Create an InputEvent to preserve undo history
            const inputEvent = new InputEvent('input', {
              bubbles: true,
              cancelable: true,
              inputType: 'insertReplacementText',
              data: rightFormatted,
            });
            textarea.dispatchEvent(inputEvent);
            setRightInput(rightFormatted);
          }
        } catch {
          // If execCommand fails, use setRangeText with InputEvent
          textarea.setRangeText(rightFormatted, 0, textarea.value.length, 'end');
          const inputEvent = new InputEvent('input', {
            bubbles: true,
            cancelable: true,
            inputType: 'insertReplacementText',
            data: rightFormatted,
          });
          textarea.dispatchEvent(inputEvent);
          setRightInput(rightFormatted);
        }
      }
    } catch {
      showAlertMessage('Error Formatting Content', 'Failed to format the content. Please check if it\'s valid.');
    } finally {
      setIsPrettifying(false);
    }
  }, [leftInput, rightInput, format, isValidationMode, setLeftInput, setRightInput, showAlertMessage]);

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

  // Validate pasted content based on format
  const validatePastedContent = useCallback((content: string): boolean => {
    if (format === 'json') {
      try {
        JSON.parse(content);
        return true;
      } catch {
        return false;
      }
    } else if (format === 'xml') {
      try {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(content, 'text/xml');
        return !xmlDoc.querySelector('parsererror');
      } catch {
        return false;
      }
    }
    // Text format accepts any content
    return true;
  }, [format]);

  /**
   * Handle paste from clipboard with content size and format validation
   */
  const handlePaste = useCallback(async (side: 'left' | 'right') => {
    try {
      const text = await navigator.clipboard.readText();
      
      // Validate clipboard content size (2MB limit)
      if (!validateClipboardSize(text)) {
        return;
      }

      // Validate format
      if (!validatePastedContent(text)) {
        const formatName = format === 'json' ? 'JSON' : format === 'xml' ? 'XML' : 'Text';
        showAlertMessage(
          'Invalid Content',
          `The pasted content is not valid ${formatName}. Please paste ${formatName} content only.`
        );
        return;
      }

      // Set the content
      if (side === 'left') {
        setLeftInput(text);
      } else {
        setRightInput(text);
      }
    } catch (error) {
      // Fallback if clipboard API fails
      console.warn('Clipboard API failed:', error);
    }
  }, [validateClipboardSize, validatePastedContent, format, showAlertMessage, setLeftInput, setRightInput]);

  /**
   * Handle paste event directly in text area with format validation
   */
  const handleTextAreaPaste = useCallback((e: React.ClipboardEvent<HTMLTextAreaElement>, side: 'left' | 'right') => {
    const text = e.clipboardData.getData('text');
    
    if (!text) return;
    
    // Validate clipboard content size (2MB limit)
    if (!validateClipboardSize(text)) {
      e.preventDefault();
      return;
    }

    // Validate pasted content format
    if (!validatePastedContent(text)) {
      e.preventDefault();
      const formatName = format === 'json' ? 'JSON' : format === 'xml' ? 'XML' : 'Text';
      showAlertMessage(
        'Invalid Content',
        `The pasted content is not valid ${formatName}. Please paste ${formatName} content only.`
      );
      return;
    }
  }, [format, validatePastedContent, validateClipboardSize, showAlertMessage]);

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
                {format !== 'text' && (
                  <ActionButton 
                    onClick={handlePrettier} 
                    title="Format/Prettify content"
                    disabled={isPrettierDisabled}
                    aria-label="Format and prettify content"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 20h9"></path>
                      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                    </svg>
                    <span>Prettier</span>
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
                <ToggleLabel>
                  <ToggleSwitch
                    checked={preserveSession}
                    onChange={handlePreserveSessionChange}
                  />
                  <span>Auto-save</span>
                </ToggleLabel>
                <Button
                  onClick={handleCompare}
                  disabled={!canCompare || isComparing}
                  variant="primary"
                >
                  {isValidationMode ? 'Validate' : 'Compare'}
                </Button>
                <Button
                  onClick={handleClearAll}
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
                {format !== 'text' && (
                  <ActionButton 
                    onClick={handlePrettier} 
                    title="Format/Prettify content"
                    disabled={isPrettierDisabled}
                    aria-label="Format and prettify content"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 20h9"></path>
                      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                    </svg>
                    <span>Prettier</span>
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
                <ToggleLabel>
                  <ToggleSwitch
                    checked={preserveSession}
                    onChange={handlePreserveSessionChange}
                  />
                  <span>Auto-save</span>
                </ToggleLabel>
                <Button
                  onClick={handleCompare}
                  disabled={!canCompare || isComparing}
                  variant="primary"
                >
                  Validate
                </Button>
                <Button
                  onClick={handleClearAll}
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
          accept={format === 'json' ? '.json' : format === 'xml' ? '.xml' : '.text,.txt'}
          onChange={(e) => handleFileChange(e, 'left')}
        />
        {!isValidationMode && (
          <HiddenFileInput
            ref={rightFileInputRef}
            type="file"
            accept={format === 'json' ? '.json' : format === 'xml' ? '.xml' : '.text,.txt'}
            onChange={(e) => handleFileChange(e, 'right')}
          />
        )}
        <InputSection>
          <InputPanelWrapper>
            <InputPanel
              $isDragOver={leftDragDrop.isDragOver}
              onDragEnter={leftDragDrop.onDragEnter}
              onDragOver={leftDragDrop.onDragOver}
              onDragLeave={leftDragDrop.onDragLeave}
              onDrop={leftDragDrop.onDrop}
            >
              {leftDragDrop.isDragOver && (
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
                <TextArea
                  ref={leftTextareaRef}
                  value={leftInput}
                  onChange={(e) => setLeftInput(e.target.value)}
                  onPaste={(e) => handleTextAreaPaste(e, 'left')}
                  placeholder="Paste your content here... (or drag and drop a file)"
                  spellCheck={false}
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
                $isDragOver={rightDragDrop.isDragOver}
                onDragEnter={rightDragDrop.onDragEnter}
                onDragOver={rightDragDrop.onDragOver}
                onDragLeave={rightDragDrop.onDragLeave}
                onDrop={rightDragDrop.onDrop}
              >
                {rightDragDrop.isDragOver && (
                  <DragOverlay>
                    <div>Drop file here to load content</div>
                  </DragOverlay>
                )}
                <PanelHeader>
                  <span>RIGHT</span>
                  <PanelActions>
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
                    <ActionButton onClick={() => handleUpload('right')} title="Upload file">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="17 8 12 3 7 8"></polyline>
                        <line x1="12" y1="3" x2="12" y2="15"></line>
                      </svg>
                      <span>Upload</span>
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
                  <TextArea
                    ref={rightTextareaRef}
                    value={rightInput}
                    onChange={(e) => setRightInput(e.target.value)}
                    onPaste={(e) => handleTextAreaPaste(e, 'right')}
                    placeholder="Paste your content here... (or drag and drop a file)"
                    spellCheck={false}
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
                      <StatValue $type="added">+{stats?.added || 0}</StatValue>
                    </StatItem>
                    <StatItem>
                      <StatLabel>REMOVED</StatLabel>
                      <StatValue $type="removed">-{stats?.removed || 0}</StatValue>
                    </StatItem>
                    <StatItem>
                      <StatLabel>CHANGED</StatLabel>
                      <StatValue $type="changed">~{stats?.changed || 0}</StatValue>
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
      {isPrettifying && (
        <Loading message="Formatting content..." />
      )}
    </>
  );
};

export default DiffChecker;

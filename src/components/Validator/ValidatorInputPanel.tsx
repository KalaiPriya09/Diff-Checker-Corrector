import React from 'react';
import type { ViewType } from '../../types/common';
import { InputActions } from '../InputActions';
import { TextAreaWithLineNumbers } from '../TextAreaWithLineNumbers';
import { Button } from '../button';
import {
  InputSection,
  SectionHeader,
  LabelContainer,
  Label,
  StatusBadge,
  CheckmarkSymbol,
  CrossSymbol,
  TextAreaWrapper,
  ActionsContainer,
  ContentSize,
} from './Validator.styles';

interface ValidatorInputPanelProps {
  // View configuration
  viewType: ViewType;
  acceptTypes: string[];
  inputId: string;
  
  // Input values
  input: string;
  
  // Input handlers
  onInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onPaste: (e: React.ClipboardEvent<HTMLTextAreaElement>) => void;
  
  // File operations
  onFileLoad: (content: string) => void;
  onFileError: (error: string) => void;
  onFormat?: (formattedContent: string) => void;
  onSampleLoad: () => void;
  onUrlLoad?: (content: string) => void;
  
  // Drag and drop
  isDragging: boolean;
  dragHandlers: {
    onDragEnter: (e: React.DragEvent) => void;
    onDragLeave: (e: React.DragEvent) => void;
    onDragOver: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent) => void;
  };
  
  // Content size
  contentSize: string;
  
  // Validation state
  hasValidated: boolean;
  isValid?: boolean;
  
  // Validate action
  onValidate: () => void;
}

export const ValidatorInputPanel: React.FC<ValidatorInputPanelProps> = ({
  viewType,
  acceptTypes,
  inputId,
  input,
  onInputChange,
  onPaste,
  onFileLoad,
  onFileError,
  onFormat,
  onSampleLoad,
  onUrlLoad,
  isDragging,
  dragHandlers,
  contentSize,
  hasValidated,
  isValid,
  onValidate,
}) => {
  return (
    <InputSection>
      <SectionHeader>
        <LabelContainer>
          <Label htmlFor={inputId}>Input Content</Label>
          {hasValidated && isValid !== undefined && (
            <StatusBadge isValid={isValid}>
              {isValid ? (
                <>
                  <CheckmarkSymbol>✓</CheckmarkSymbol> Valid
                </>
              ) : (
                <>
                  <CrossSymbol>✗</CrossSymbol> Invalid
                </>
              )}
            </StatusBadge>
          )}
        </LabelContainer>
        <ActionsContainer>
          <InputActions
            content={input}
            viewType={viewType}
            onFileLoad={onFileLoad}
            onError={onFileError}
            onFormat={onFormat}
            onSampleLoad={onSampleLoad}
            onUrlLoad={onUrlLoad}
            acceptTypes={acceptTypes}
          />
          <Button onClick={onValidate} variant="primary">
            <span>▶</span>
            <span>Validate</span>
          </Button>
        </ActionsContainer>
      </SectionHeader>
      <TextAreaWrapper>
        <TextAreaWithLineNumbers
          id={inputId}
          value={input}
          onChange={onInputChange}
          onPaste={onPaste}
          placeholder="Paste your content here to validate... (or drag and drop a file)"
          minHeight={400}
          {...dragHandlers}
          style={{
            borderColor: isDragging ? '#79589b' : undefined,
            borderWidth: isDragging ? '2px' : undefined,
            backgroundColor: isDragging ? 'rgba(121, 88, 155, 0.1)' : undefined,
          }}
        />
      </TextAreaWrapper>
      <ContentSize>Size: {contentSize}</ContentSize>
    </InputSection>
  );
};


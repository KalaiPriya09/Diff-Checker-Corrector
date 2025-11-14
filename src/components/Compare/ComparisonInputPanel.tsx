import React from 'react';
import type { ViewType } from '../../types/common';
import { ComparisonOptionsComponent } from '../ComparisonOptions';
import type { ComparisonOptions as ComponentComparisonOptions } from '../ComparisonOptions';
import { InputActions } from '../InputActions';
import { TextAreaWithLineNumbers } from '../TextAreaWithLineNumbers';
import { Button } from '../button';
import { CustomSelect } from '../CustomSelect';
import {
  TopBar,
  OptionsWrapper,
  InputsContainer,
  InputSection,
  InputLabel,
  InputHeaderWrapper,
  ContentSize,
} from './Compare.styles';

interface ComparisonInputPanelProps {
  // View configuration
  viewType: ViewType;
  acceptTypes: string[];
  
  // Input values
  input1: string;
  input2: string;
  
  // Input handlers
  onInput1Change: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onInput2Change: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onPaste1: (e: React.ClipboardEvent<HTMLTextAreaElement>) => void;
  onPaste2: (e: React.ClipboardEvent<HTMLTextAreaElement>) => void;
  
  // File operations
  onFileLoad1: (content: string) => void;
  onFileLoad2: (content: string) => void;
  onFileError: (error: string) => void;
  onFormat1?: (formattedContent: string) => void;
  onFormat2?: (formattedContent: string) => void;
  onSampleLoad1: () => void;
  onSampleLoad2: () => void;
  onUrlLoad1?: (content: string) => void;
  onUrlLoad2?: (content: string) => void;
  
  // Drag and drop
  isDragging1: boolean;
  isDragging2: boolean;
  dragHandlers1: {
    onDragEnter: (e: React.DragEvent) => void;
    onDragLeave: (e: React.DragEvent) => void;
    onDragOver: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent) => void;
  };
  dragHandlers2: {
    onDragEnter: (e: React.DragEvent) => void;
    onDragLeave: (e: React.DragEvent) => void;
    onDragOver: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent) => void;
  };
  
  // Content size
  contentSize1: string;
  contentSize2: string;
  
  // Comparison options
  options: ComponentComparisonOptions;
  onOptionsChange: (options: ComponentComparisonOptions) => void;
  showKeyOrder?: boolean;
  showAttributeOrder?: boolean;
  showArrayOrder?: boolean;
  
  // Compare action
  onCompare: () => void;
  
  // Text Compare specific
  compareMode?: 'line' | 'word';
  onCompareModeChange?: (mode: 'line' | 'word') => void;
}

export const ComparisonInputPanel: React.FC<ComparisonInputPanelProps> = ({
  viewType,
  acceptTypes,
  input1,
  input2,
  onInput1Change,
  onInput2Change,
  onPaste1,
  onPaste2,
  onFileLoad1,
  onFileLoad2,
  onFileError,
  onFormat1,
  onFormat2,
  onSampleLoad1,
  onSampleLoad2,
  onUrlLoad1,
  onUrlLoad2,
  isDragging1,
  isDragging2,
  dragHandlers1,
  dragHandlers2,
  contentSize1,
  contentSize2,
  options,
  onOptionsChange,
  showKeyOrder = false,
  showAttributeOrder = false,
  showArrayOrder = false,
  onCompare,
  compareMode,
  onCompareModeChange,
}) => {
  const inputId1 = `${viewType}-input-1`;
  const inputId2 = `${viewType}-input-2`;

  return (
    <>
      <TopBar>
        <OptionsWrapper>
          <ComparisonOptionsComponent
            options={options}
            onChange={onOptionsChange}
            showKeyOrder={showKeyOrder}
            showAttributeOrder={showAttributeOrder}
            showArrayOrder={showArrayOrder}
          />
        </OptionsWrapper>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {compareMode !== undefined && onCompareModeChange && (
            <CustomSelect
              value={compareMode}
              options={[
                { value: 'line', label: 'Line' },
                { value: 'word', label: 'Word' },
              ]}
              onChange={(value) => onCompareModeChange(value as 'line' | 'word')}
            />
          )}
          <Button onClick={onCompare} variant="primary">
            <span>↻</span>
            <span>Compare</span>
          </Button>
        </div>
      </TopBar>

      <InputsContainer>
        <InputSection>
          <InputHeaderWrapper>
            <InputLabel htmlFor={inputId1}>Left</InputLabel>
            <InputActions
              content={input1}
              viewType={viewType}
              side="left"
              onFileLoad={onFileLoad1}
              onError={onFileError}
              onFormat={onFormat1}
              onSampleLoad={onSampleLoad1}
              onUrlLoad={onUrlLoad1}
              acceptTypes={acceptTypes}
            />
          </InputHeaderWrapper>
          <TextAreaWithLineNumbers
            id={inputId1}
            value={input1}
            onChange={onInput1Change}
            onPaste={onPaste1}
            placeholder="Paste your content here... (or drag and drop a file)"
            minHeight={300}
            {...dragHandlers1}
            style={{
              borderColor: isDragging1 ? '#79589b' : undefined,
              borderWidth: isDragging1 ? '2px' : undefined,
              backgroundColor: isDragging1 ? 'rgba(121, 88, 155, 0.1)' : undefined,
            }}
          />
          <ContentSize>Size: {contentSize1}</ContentSize>
        </InputSection>
        
        <InputSection>
          <InputHeaderWrapper>
            <InputLabel htmlFor={inputId2}>Right</InputLabel>
            <InputActions
              content={input2}
              viewType={viewType}
              side="right"
              onFileLoad={onFileLoad2}
              onError={onFileError}
              onFormat={onFormat2}
              onSampleLoad={onSampleLoad2}
              onUrlLoad={onUrlLoad2}
              acceptTypes={acceptTypes}
            />
          </InputHeaderWrapper>
          <TextAreaWithLineNumbers
            id={inputId2}
            value={input2}
            onChange={onInput2Change}
            onPaste={onPaste2}
            placeholder="Paste your content here... (or drag and drop a file)"
            minHeight={300}
            {...dragHandlers2}
            style={{
              borderColor: isDragging2 ? '#79589b' : undefined,
              borderWidth: isDragging2 ? '2px' : undefined,
              backgroundColor: isDragging2 ? 'rgba(121, 88, 155, 0.1)' : undefined,
            }}
          />
          <ContentSize>Size: {contentSize2}</ContentSize>
        </InputSection>
      </InputsContainer>
    </>
  );
};


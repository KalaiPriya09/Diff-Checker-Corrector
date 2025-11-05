import React, { useRef, useEffect, useMemo } from 'react';
import {
  TextAreaContainer,
  LineNumbersContainer,
  LineNumber,
  TextAreaWrapper,
  StyledTextArea,
} from './TextAreaWithLineNumbers.styles';

export interface TextAreaWithLineNumbersProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  value: string;
  minHeight?: string | number;
}

export const TextAreaWithLineNumbers: React.FC<TextAreaWithLineNumbersProps> = ({
  value,
  onChange,
  onScroll,
  style,
  minHeight = 400,
  ...rest
}) => {
  // Extract style props that should apply to container (border, background)
  const containerStyle: React.CSSProperties = {};
  const textareaStyle: React.CSSProperties = { ...style };

  if (style) {
    if ('borderColor' in style) {
      containerStyle.borderColor = style.borderColor as string;
      delete textareaStyle.borderColor;
    }
    if ('borderWidth' in style) {
      containerStyle.borderWidth = style.borderWidth as string | number;
      delete textareaStyle.borderWidth;
    }
    if ('backgroundColor' in style) {
      containerStyle.backgroundColor = style.backgroundColor as string;
      delete textareaStyle.backgroundColor;
    }
  }
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  // Calculate line numbers based on content
  const lineCount = useMemo(() => {
    if (!value) return 1;
    return value.split('\n').length;
  }, [value]);

  // Generate line numbers array
  const lineNumbers = useMemo(() => {
    return Array.from({ length: lineCount }, (_, i) => i + 1);
  }, [lineCount]);

  // Sync scroll between textarea and line numbers
  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = e.currentTarget.scrollTop;
    }
    if (onScroll) {
      onScroll(e);
    }
  };

  // Sync scroll on mount and when content changes
  useEffect(() => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  }, [value]);

  // Extract drag handlers from rest props
  const {
    onDragOver,
    onDragLeave,
    onDrop,
    onDragEnter,
    ...textareaProps
  } = rest;

  // Convert drag handlers to work with div element (container) instead of textarea
  const dragHandlers = {
    onDragOver: onDragOver ? (e: React.DragEvent<HTMLDivElement>) => {
      onDragOver(e as unknown as React.DragEvent<HTMLTextAreaElement>);
    } : undefined,
    onDragLeave: onDragLeave ? (e: React.DragEvent<HTMLDivElement>) => {
      onDragLeave(e as unknown as React.DragEvent<HTMLTextAreaElement>);
    } : undefined,
    onDrop: onDrop ? (e: React.DragEvent<HTMLDivElement>) => {
      onDrop(e as unknown as React.DragEvent<HTMLTextAreaElement>);
    } : undefined,
    onDragEnter: onDragEnter ? (e: React.DragEvent<HTMLDivElement>) => {
      onDragEnter(e as unknown as React.DragEvent<HTMLTextAreaElement>);
    } : undefined,
  };

  return (
    <TextAreaContainer {...dragHandlers} style={containerStyle}>
      <LineNumbersContainer ref={lineNumbersRef}>
        {lineNumbers.map((num) => (
          <LineNumber key={num}>{num}</LineNumber>
        ))}
      </LineNumbersContainer>
      <TextAreaWrapper>
        <StyledTextArea
          ref={textareaRef}
          value={value}
          onChange={onChange}
          onScroll={handleScroll}
          $minHeight={minHeight}
          style={textareaStyle}
          {...textareaProps}
        />
      </TextAreaWrapper>
    </TextAreaContainer>
  );
};


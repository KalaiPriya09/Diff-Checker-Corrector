/**
 * Virtual Diff Content Component
 * 
 * Implements native virtual scrolling without external libraries
 * Only renders visible lines for optimal performance
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled from 'styled-components';
import type { DiffLine as DiffLineType } from '../../utils/diffChecker';

const ITEM_HEIGHT = 24; // Height of each line in pixels
const BUFFER_SIZE = 20; // Number of extra items to render above/below viewport
const SCROLL_THROTTLE = 16; // ~60fps

interface VirtualScrollContainerProps {
  $height: number;
}

const ScrollContainer = styled.div<VirtualScrollContainerProps>`
  height: ${props => props.$height}px;
  overflow-y: auto;
  overflow-x: auto;
  position: relative;
  will-change: scroll-position;
  contain: layout style paint;
  background-color: ${(props) => props.theme.colors.cardBackground};
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: ${(props) => props.theme.radii.md};
  
  /* Smooth scrolling optimization */
  -webkit-overflow-scrolling: touch;
  scroll-behavior: auto;
  
  /* Hardware acceleration */
  transform: translateZ(0);
  backface-visibility: hidden;
  
  &::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  &::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors.background};
    border-radius: ${(props) => props.theme.radii.sm};
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.border};
    border-radius: ${(props) => props.theme.radii.sm};
  }

  &::-webkit-scrollbar-thumb:hover {
    background: ${({ theme }) => theme.colors.borderLight};
  }
`;

interface VirtualContentProps {
  $totalHeight: number;
  $offsetY: number;
}

const VirtualContent = styled.div<VirtualContentProps>`
  height: ${props => props.$totalHeight}px;
  position: relative;
  contain: layout style paint;
`;

const VisibleItems = styled.div<{ $offsetY: number }>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  transform: translateY(${props => props.$offsetY}px);
  will-change: transform;
  contain: layout style paint;
`;

interface DiffLineProps {
  $type: 'unchanged' | 'added' | 'removed' | 'changed';
}

const DiffLine = styled.div<DiffLineProps>`
  display: flex;
  height: ${ITEM_HEIGHT}px;
  padding: ${(props) => props.theme.spacing(1)} ${(props) => props.theme.spacing(3)};
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-all;
  contain: layout style paint;
  will-change: auto;
  
  ${(props) => {
    switch (props.$type) {
      case 'added':
        return `
          background-color: ${props.theme.colors.diffAddedBg};
          color: ${props.theme.colors.diffAddedText};
          border-left: 3px solid ${props.theme.colors.diffAddedText};
        `;
      case 'removed':
        return `
          background-color: ${props.theme.colors.diffRemovedBg};
          color: ${props.theme.colors.diffRemovedText};
          border-left: 3px solid ${props.theme.colors.error};
        `;
      case 'changed':
        return `
          background-color: ${props.theme.colors.diffModifiedBg};
          color: ${props.theme.colors.diffModifiedText};
          border-left: 3px solid ${props.theme.colors.diffModifiedText};
        `;
      default:
        return `
          background-color: ${props.theme.colors.surface};
          color: ${props.theme.colors.text};
        `;
    }
  }}
`;

const LineNumber = styled.span`
  display: inline-block;
  width: 50px;
  text-align: right;
  margin-right: ${(props) => props.theme.spacing(2)};
  color: ${(props) => props.theme.colors.subtleText};
  user-select: none;
  flex-shrink: 0;
`;

interface VirtualDiffContentProps {
  lines: DiffLineType[];
  containerHeight?: number;
}

export const VirtualDiffContent: React.FC<VirtualDiffContentProps> = ({ 
  lines, 
  containerHeight = 600 
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>();
  const lastScrollTime = useRef(0);

  const totalHeight = lines.length * ITEM_HEIGHT;
  
  // Calculate visible range with buffer
  const startIndex = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - BUFFER_SIZE);
  const endIndex = Math.min(
    lines.length,
    Math.ceil((scrollTop + containerHeight) / ITEM_HEIGHT) + BUFFER_SIZE
  );
  
  const visibleLines = lines.slice(startIndex, endIndex);
  const offsetY = startIndex * ITEM_HEIGHT;

  // Throttled scroll handler with RAF
  const handleScroll = useCallback((e: Event) => {
    const target = e.target as HTMLDivElement;
    const now = Date.now();
    
    // Throttle to ~60fps
    if (now - lastScrollTime.current < SCROLL_THROTTLE) {
      return;
    }
    
    lastScrollTime.current = now;
    
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
    
    rafRef.current = requestAnimationFrame(() => {
      setScrollTop(target.scrollTop);
    });
  }, []);

  // Attach scroll listener
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    container.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      container.removeEventListener('scroll', handleScroll);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [handleScroll]);

  // Reset scroll on new content
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
      setScrollTop(0);
    }
  }, [lines.length]);

  return (
    <ScrollContainer 
      ref={scrollContainerRef} 
      $height={containerHeight}
      role="region"
      aria-label="Virtual diff content"
    >
      <VirtualContent $totalHeight={totalHeight} $offsetY={0}>
        <VisibleItems $offsetY={offsetY}>
          {visibleLines.map((line, index) => {
            const actualIndex = startIndex + index;
            return (
              <DiffLine key={actualIndex} $type={line.type}>
                <LineNumber>{line.lineNumber}</LineNumber>
                <span>{line.content || ' '}</span>
              </DiffLine>
            );
          })}
        </VisibleItems>
      </VirtualContent>
    </ScrollContainer>
  );
};


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
  
  @media (max-width: 480px) {
    border-radius: ${(props) => props.theme.radii.sm};
  }
  
  &::-webkit-scrollbar {
    width: 8px;
    height: 8px;
    
    @media (max-width: 480px) {
      width: 6px;
      height: 6px;
    }
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
    background: ${({ theme }) => theme.colors.textSecondary};
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
  padding: 4px 12px;
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-all;
  contain: layout style paint;
  will-change: auto;
  
  @media (max-width: 768px) {
    font-size: 0.8125rem;
    padding: 4px 8px;
  }
  
  @media (max-width: 480px) {
    font-size: 0.75rem;
    padding: 2px 6px;
    line-height: 1.4;
  }
  
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
          background-color: ${props.theme.colors.diffChangedBg};
          color: ${props.theme.colors.diffChangedText};
          border-left: 3px solid ${props.theme.colors.diffChangedText};
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
  margin-right: 8px;
  color: ${(props) => props.theme.colors.subtleText};
  user-select: none;
  flex-shrink: 0;
  
  @media (max-width: 768px) {
    width: 42px;
    margin-right: 6px;
  }
  
  @media (max-width: 480px) {
    width: 38px;
    margin-right: 4px;
  }
`;

interface VirtualDiffContentProps {
  lines: DiffLineType[];
  containerHeight?: number;
}

// Calculate responsive height based on viewport
const getResponsiveHeight = (): number => {
  if (typeof window === 'undefined') return 600;
  
  const viewportHeight = window.innerHeight;
  const viewportWidth = window.innerWidth;
  
  if (viewportWidth <= 480) {
    return Math.max(250, viewportHeight * 0.35);
  } else if (viewportWidth <= 768) {
    return Math.max(350, viewportHeight * 0.4);
  } else if (viewportWidth <= 1024) {
    return Math.max(450, viewportHeight * 0.45);
  }
  
  return 600;
};

export const VirtualDiffContent: React.FC<VirtualDiffContentProps> = ({ 
  lines, 
  containerHeight 
}) => {
  const [responsiveHeight, setResponsiveHeight] = useState<number>(
    containerHeight || (typeof window !== 'undefined' ? getResponsiveHeight() : 600)
  );

  useEffect(() => {
    if (containerHeight) {
      setResponsiveHeight(containerHeight);
      return;
    }
    
    const updateHeight = () => {
      setResponsiveHeight(getResponsiveHeight());
    };
    
    if (typeof window !== 'undefined') {
      updateHeight();
    window.addEventListener('resize', updateHeight);
      
      return () => {
        window.removeEventListener('resize', updateHeight);
      };
    }
  }, [containerHeight]);
  
  const [scrollTop, setScrollTop] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>();
  const lastScrollTime = useRef(0);

  const totalHeight = lines.length * ITEM_HEIGHT;
  
  // Calculate visible range with buffer
  const startIndex = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - BUFFER_SIZE);
  const endIndex = Math.min(
    lines.length,
    Math.ceil((scrollTop + responsiveHeight) / ITEM_HEIGHT) + BUFFER_SIZE
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
      $height={responsiveHeight}
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


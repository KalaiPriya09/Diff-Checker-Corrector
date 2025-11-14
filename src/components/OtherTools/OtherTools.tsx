import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useTheme } from 'styled-components';
import type { componentType } from '../../types/common';
import {
  OtherToolsContainer,
  OtherToolsButton,
  OtherToolsDropdown,
  ToolOption,
  ToolIcon,
  ToolContent,
  ToolTitle,
  ToolDescription,
  ChevronIcon,
} from './OtherTools.styles';

export interface ToolOptionType {
  id: componentType;
  title: string;
  description: string;
  iconColor: string;
  icon: React.ReactNode;
  onClick?: () => void;
}

interface OtherToolsProps {
  onFormatChange?: (format: componentType) => void;
}

// Format map matching DiffChecker.tsx (lines 133-139)
const formatMap: Record<componentType, string> = {
  'json-compare': 'JSON Compare',
  'xml-compare': 'XML Compare',
  'text-compare': 'Text Compare',
  'json-validate': 'JSON Validate',
  'xml-validate': 'XML Validate',
};

// Icon and description configuration for each component type
// Using theme colors: primary purple for compare tools, lighter purple for validate tools
const getToolConfig = (type: componentType, primaryColor: string): { description: string; iconColor: string; icon: React.ReactNode } => {
  // Theme colors - these will be used dynamically
  const compareIconColor = primaryColor; // Primary color for compare tools
  const validateIconColor = primaryColor; // Primary color for validate tools
  
  const configs: Record<componentType, { description: string; iconColor: string; icon: React.ReactNode }> = {
    'json-compare': {
      description: 'Compare JSON files',
      iconColor: compareIconColor,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 6h8M8 12h8M8 18h8" />
          <path d="M4 6h4M4 12h4M4 18h4" />
        </svg>
      ),
    },
    'xml-compare': {
      description: 'Compare XML files',
      iconColor: compareIconColor,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 6h8M8 12h8M8 18h8" />
          <path d="M4 6h4M4 12h4M4 18h4" />
        </svg>
      ),
    },
    'text-compare': {
      description: 'Compare text files',
      iconColor: compareIconColor,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 6h8M8 12h8M8 18h8" />
          <path d="M4 6h4M4 12h4M4 18h4" />
        </svg>
      ),
    },
    'json-validate': {
      description: 'Validate JSON syntax',
      iconColor: validateIconColor,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M9 12l2 2 4-4" />
        </svg>
      ),
    },
    'xml-validate': {
      description: 'Validate XML syntax',
      iconColor: validateIconColor,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M9 12l2 2 4-4" />
        </svg>
      ),
    },
  };
  return configs[type];
};

export const OtherTools: React.FC<OtherToolsProps> = ({ onFormatChange }) => {
  const theme = useTheme();
  
  // Generate tools from formatMap
  const tools = useMemo(() => {
    const componentTypes: componentType[] = [
      'json-compare',
      'xml-compare',
      'text-compare',
      'json-validate',
      'xml-validate',
    ];

    return componentTypes.map((type) => {
      const config = getToolConfig(type, theme.colors.primary);
      return {
        id: type,
        title: formatMap[type],
        description: config.description,
        iconColor: config.iconColor,
        icon: config.icon,
        onClick: () => onFormatChange?.(type),
      };
    });
  }, [onFormatChange, theme.colors.primary]);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleToggle = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const handleSelect = useCallback((tool: ToolOptionType) => {
    tool.onClick?.();
    setIsOpen(false);
  }, []);

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen, handleClickOutside]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleToggle();
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  }, [handleToggle]);

  return (
    <OtherToolsContainer ref={containerRef}>
      <OtherToolsButton
        type="button"
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span>Other Tools</span>
        <ChevronIcon isOpen={isOpen}>
          <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </ChevronIcon>
      </OtherToolsButton>
      {isOpen && (
        <OtherToolsDropdown role="listbox">
          {tools.map((tool) => (
            <ToolOption
              key={tool.id}
              role="option"
              onClick={() => handleSelect(tool)}
            >
              <ToolIcon $color={tool.iconColor}>
                {tool.icon}
              </ToolIcon>
              <ToolContent>
                <ToolTitle>{tool.title}</ToolTitle>
                <ToolDescription>{tool.description}</ToolDescription>
              </ToolContent>
            </ToolOption>
          ))}
        </OtherToolsDropdown>
      )}
    </OtherToolsContainer>
  );
};


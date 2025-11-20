import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  SelectContainer,
  SelectButton,
  SelectDropdown,
  SelectOption,
  SelectChevron,
} from './CustomSelect.styles';

export interface CustomSelectOption {
  value: string;
  label: string;
}

export interface CustomSelectProps {
  value: string;
  options: CustomSelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  value,
  options,
  onChange,
  placeholder = 'Select...',
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  const handleToggle = useCallback(() => {
    if (!disabled) {
      setIsOpen(prev => !prev);
    }
  }, [disabled]);

  const handleSelect = useCallback((optionValue: string, event?: React.MouseEvent) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    onChange(optionValue);
    setIsOpen(false);
  }, [onChange]);

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

  // Close dropdown when value changes externally (e.g., from parent component)
  useEffect(() => {
    if (isOpen) {
      setIsOpen(false);
    }
  }, [value]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (disabled) return;
    
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleToggle();
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
      } else {
        const currentIndex = options.findIndex(opt => opt.value === value);
        const nextIndex = currentIndex < options.length - 1 ? currentIndex + 1 : 0;
        onChange(options[nextIndex].value);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (isOpen) {
        const currentIndex = options.findIndex(opt => opt.value === value);
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : options.length - 1;
        onChange(options[prevIndex].value);
      }
    }
  }, [disabled, isOpen, value, options, onChange, handleToggle]);

  return (
    <SelectContainer ref={containerRef}>
      <SelectButton
        type="button"
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span>{selectedOption?.label || placeholder}</span>
        <SelectChevron isOpen={isOpen}>
          <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </SelectChevron>
      </SelectButton>
      {isOpen && (
        <SelectDropdown role="listbox">
          {options.map((option) => (
            <SelectOption
              key={option.value}
              role="option"
              aria-selected={option.value === value}
              isSelected={option.value === value}
              onClick={(e) => handleSelect(option.value, e)}
            >
              {option.label}
            </SelectOption>
          ))}
        </SelectDropdown>
      )}
    </SelectContainer>
  );
};


import styled, { css } from 'styled-components';

export type ButtonVariant = 'primary' | 'secondary' | 'icon' | 'action' | 'transparent';

export interface StyledButtonProps {
  $variant?: ButtonVariant;
  $disabled?: boolean;
}

const primaryStyles = css<StyledButtonProps>`
  background: ${props => props.$disabled ? '#9ca3af' : '#79589b'};
  color: #ffffff;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  gap: 8px;
  opacity: ${props => props.$disabled ? 0.6 : 1};
  
  &:hover:not(:disabled) {
    background: #6a4d87;
    transform: translateY(-1px);
    box-shadow: 0 4px 6px rgba(121, 88, 155, 0.3);
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
  
  @media (max-width: 768px) {
    padding: 10px 20px;
    font-size: 13px;
  }
  
  @media (max-width: 480px) {
    padding: 8px 16px;
    font-size: 12px;
    gap: 6px;
  }
`;

const secondaryStyles = css<StyledButtonProps>`
  background-color: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: #ffffff;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  gap: 8px;
  
  &:hover:not(:disabled) {
    background-color: rgba(255, 255, 255, 0.25);
    border-color: rgba(255, 255, 255, 0.4);
  }
  
  &:active:not(:disabled) {
    transform: scale(0.98);
  }
  
  @media (max-width: 768px) {
    padding: 8px 16px;
    font-size: 13px;
  }
  
  @media (max-width: 480px) {
    width: 36px;
    height: 36px;
    padding: 0;
    border-radius: 8px;
    
    span:last-child {
      display: none;
    }
  }
`;

const iconStyles = css<StyledButtonProps>`
  background-color: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: #ffffff;
  padding: 8px;
  border-radius: 8px;
  width: 40px;
  height: 40px;
  
  &:hover:not(:disabled) {
    background-color: rgba(255, 255, 255, 0.25);
    border-color: rgba(255, 255, 255, 0.4);
    transform: scale(1.05);
  }
  
  &:active:not(:disabled) {
    transform: scale(0.98);
  }
  
  @media (max-width: 480px) {
    width: 36px;
    height: 36px;
    padding: 6px;
  }
`;

const actionStyles = css<StyledButtonProps>`
  background-color: ${props => props.theme.colors.surfaceHover};
  color: ${props => props.theme.colors.text};
  border: 1px solid ${props => props.theme.colors.border};
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 13px;
  gap: 6px;
  position: relative;
  
  &:hover:not(:disabled) {
    background-color: ${props => props.theme.colors.surface};
    border-color: ${props => props.theme.colors.primary};
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  }
  
  svg {
    flex-shrink: 0;
  }
  
  @media (max-width: 768px) {
    padding: 6px 10px;
    font-size: 12px;
    gap: 4px;
    
    svg {
      width: 14px;
      height: 14px;
    }
  }
  
  @media (max-width: 480px) {
    padding: 6px 8px;
    font-size: 11px;
    
    span {
      display: none;
    }
    
    svg {
      width: 16px;
      height: 16px;
    }
  }
`;

const transparentStyles = css<StyledButtonProps>`
  background: transparent;
  border: none;
  color: #ffffff;
  font-size: 24px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  padding: 0;
  line-height: 1;
  
  &:hover:not(:disabled) {
    background-color: rgba(255, 255, 255, 0.2);
  }
  
  &:active:not(:disabled) {
    background-color: rgba(255, 255, 255, 0.3);
  }
  
  @media (max-width: 480px) {
    font-size: 20px;
    width: 28px;
    height: 28px;
  }
`;

export const StyledButton = styled.button<StyledButtonProps>`
  cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  white-space: nowrap;
  border: none;
  font-weight: ${props => {
    switch (props.$variant) {
      case 'primary':
      case 'secondary':
        return '600';
      case 'action':
        return '500';
      default:
        return '400';
    }
  }};
  
  ${props => {
    switch (props.$variant) {
      case 'secondary':
        return secondaryStyles;
      case 'icon':
        return iconStyles;
      case 'action':
        return actionStyles;
      case 'transparent':
        return transparentStyles;
      case 'primary':
      default:
        return primaryStyles;
    }
  }}
  
  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

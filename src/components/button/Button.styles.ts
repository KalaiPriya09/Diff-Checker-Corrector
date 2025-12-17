import styled, { css } from 'styled-components';

export type ButtonVariant = 'primary' | 'secondary' | 'icon' | 'action' | 'transparent';

export interface StyledButtonProps {
  $variant?: ButtonVariant;
  $disabled?: boolean;
}

const primaryStyles = css<StyledButtonProps>`
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.gradientStart}, ${({ theme }) => theme.colors.gradientEnd});
  color: #ffffff;
  padding: 12px 24px;
  height: 44px;
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: 14px;
  gap: 8px;
  box-shadow: 0 4px 12px ${({ theme }) => theme.colors.purpleMedium};
  border: 1px solid rgba(255, 255, 255, 0.1);
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px ${({ theme }) => theme.colors.purpleMedium};
    filter: brightness(1.1);
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
    box-shadow: 0 4px 12px ${({ theme }) => theme.colors.purpleMedium};
  }
  
  @media (max-width: 768px) {
    padding: 10px 20px;
    height: 40px;
    font-size: 13px;
  }
  
  @media (max-width: 480px) {
    padding: 8px 16px;
    height: 36px;
    font-size: 12px;
    gap: 6px;
  }
`;

const secondaryStyles = css<StyledButtonProps>`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.text};
  padding: 10px 20px;
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: 14px;
  gap: 8px;
  backdrop-filter: blur(8px);
  
  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.surfaceHover};
    border-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.primary};
    transform: translateY(-1px);
    box-shadow: 0 4px 12px ${({ theme }) => theme.colors.purpleLight};
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
  
  @media (max-width: 768px) {
    padding: 8px 16px;
    font-size: 13px;
  }
  
  @media (max-width: 480px) {
    width: 36px;
    height: 36px;
    padding: 0;
    
    span:last-child {
      display: none;
    }
  }
`;

const iconStyles = css<StyledButtonProps>`
  background: transparent;
  border: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.text};
  padding: 8px;
  border-radius: ${({ theme }) => theme.radii.md};
  width: 40px;
  height: 40px;
  
  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.surfaceHover};
    border-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.primary};
    transform: scale(1.05);
    box-shadow: 0 4px 12px ${({ theme }) => theme.colors.purpleLight};
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
  background: ${({ theme }) => theme.colors.surfaceHover};
  color: ${({ theme }) => theme.colors.text};
  border: 1px solid ${({ theme }) => theme.colors.border};
  padding: 8px 12px;
  border-radius: ${({ theme }) => theme.radii.sm};
  font-size: 13px;
  gap: 6px;
  position: relative;
  
  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.surface};
    border-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.primary};
    transform: translateY(-1px);
    box-shadow: 0 4px 12px ${({ theme }) => theme.colors.purpleLight};
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
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
  color: ${({ theme }) => theme.colors.text};
  font-size: 24px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  padding: 0;
  line-height: 1;
  
  &:hover:not(:disabled) {
    background-color: ${({ theme }) => theme.colors.surfaceHover};
    color: ${({ theme }) => theme.colors.primary};
  }
  
  &:active:not(:disabled) {
    transform: scale(0.95);
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
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;
  border: none;
  font-family: ${({ theme }) => theme.fonts.body};
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
    opacity: 0.5;
  }
`;

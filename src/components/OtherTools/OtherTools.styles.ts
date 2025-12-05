import styled from 'styled-components';

export const OtherToolsContainer = styled.div`
  position: relative;
  display: inline-block;
`;

export const OtherToolsButton = styled.button`
  background-color: transparent;
  border: 1px solid ${props => props.theme.colors.border};
  color: ${props => props.theme.colors.text};
  padding: 8px 16px;
  border-radius: ${props => props.theme.radii.md};
  font-size: 14px;
  font-weight: 500;
  font-family: ${props => props.theme.fonts.body};
  cursor: pointer;
  outline: none;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  white-space: nowrap;
  
  &:hover {
    background-color: ${props => props.theme.colors.surfaceHover};
    border-color: ${props => props.theme.colors.primary};
    color: ${props => props.theme.colors.primary};
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:focus {
    box-shadow: 0 0 0 3px ${props => props.theme.colors.purpleLight};
  }
  
  span {
    flex: 1;
  }
  
  @media (max-width: 768px) {
    padding: 8px 14px;
    font-size: 13px;
    gap: 10px;
  }
  
  @media (max-width: 480px) {
    padding: 8px 12px;
    font-size: 12px;
    gap: 8px;
  }
`;

export const ChevronIcon = styled.span<{ isOpen: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  color: currentColor;
  transition: transform 0.2s ease;
  transform: ${props => props.isOpen ? 'rotate(180deg)' : 'rotate(0deg)'};
  flex-shrink: 0;
  
  svg {
    width: 12px;
    height: 8px;
  }
`;

export const OtherToolsDropdown = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background-color: ${props => props.theme.colors.cardBackground};
  border: 1px solid ${props => props.theme.colors.inputBorder};
  border-radius: ${props => props.theme.radii.md};
  box-shadow: ${props => props.theme.shadows.lg};
  z-index: 1001;
  overflow: hidden;
  animation: slideDown 0.2s ease-out;
  min-width: 280px;
  padding: 8px;
  
  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @media (max-width: 768px) {
    min-width: 260px;
    right: 0;
  }
  
  @media (max-width: 480px) {
    min-width: 240px;
  }
`;

export const ToolOption = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: ${props => props.theme.radii.md};
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
  
  &:hover {
    background-color: ${props => props.theme.colors.surfaceHover};
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    border-color: ${props => props.theme.colors.border};
  }
  
  &:active {
    transform: translateY(0);
    background-color: ${props => props.theme.colors.border};
  }
`;

interface ToolIconProps {
  $color: string;
}

export const ToolIcon = styled.div<ToolIconProps>`
  width: 40px;
  height: 40px;
  border-radius: ${props => props.theme.radii.md};
  background: linear-gradient(135deg, ${props => props.$color}, ${props => props.theme.colors.secondary});
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  
  svg {
    width: 20px;
    height: 20px;
  }
  
  @media (max-width: 480px) {
    width: 36px;
    height: 36px;
    
    svg {
      width: 18px;
      height: 18px;
    }
  }
`;

export const ToolContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  min-width: 0;
`;

export const ToolTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  line-height: 1.2;
  font-family: ${props => props.theme.fonts.body};
`;

export const ToolDescription = styled.div`
  font-size: 12px;
  font-weight: 400;
  color: ${props => props.theme.colors.subtleText};
  line-height: 1.3;
  font-family: ${props => props.theme.fonts.body};
`;


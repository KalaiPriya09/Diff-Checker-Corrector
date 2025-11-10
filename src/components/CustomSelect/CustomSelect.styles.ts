import styled from 'styled-components';

export const SelectContainer = styled.div`
  position: relative;
  display: inline-block;
  min-width: 120px;
  
  @media (max-width: 768px) {
    min-width: 100px;
  }
  
  @media (max-width: 480px) {
    min-width: 90px;
  }
`;

export const SelectButton = styled.button`
  width: 100%;
  padding: 10px 0px 10px 10px;
  border: 2px solid ${props => props.theme.colors.inputBorder};
  border-radius: ${props => props.theme.radii.md};
  background-color: ${props => props.theme.colors.inputBackground};
  color: ${props => props.theme.colors.text};
  font-size: 14px;
  font-weight: 500;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
  cursor: pointer;
  outline: none;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  text-align: left;
  
  &:hover:not(:disabled) {
    border-color: ${props => props.theme.colors.primary};
    background-color: ${props => props.theme.colors.surfaceHover};
  }
  
  &:focus {
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.purpleLight};
  }
  
  &:active:not(:disabled) {
    border-color: ${props => props.theme.colors.primary};
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  span {
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  @media (max-width: 768px) {
    padding: 8px 0px 8px 8px;
    font-size: 13px;
  }
  
  @media (max-width: 480px) {
    padding: 8px 0px 8px 8px;
    font-size: 12px;
  }
`;

export const SelectChevron = styled.span<{ isOpen: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.theme.colors.primary};
  transition: transform 0.2s ease;
  transform: ${props => props.isOpen ? 'rotate(180deg)' : 'rotate(0deg)'};
  flex-shrink: 0;
  
  svg {
    width: 12px;
    height: 8px;
  }
  
  @media (max-width: 768px) {
    svg {
      width: 10px;
      height: 7px;
    }
  }
`;

export const SelectDropdown = styled.div`
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background-color: ${props => props.theme.colors.inputBackground};
  border: 2px solid ${props => props.theme.colors.inputBorder};
  border-radius: ${props => props.theme.radii.md};
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  overflow: hidden;
  animation: slideDown 0.2s ease-out;
  max-height: 200px;
  overflow-y: auto;
  
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
  
  /* Custom scrollbar */
  scrollbar-width: thin;
  scrollbar-color: ${props => props.theme.colors.inputBorder} ${props => props.theme.colors.inputBackground};
  
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${props => props.theme.colors.inputBackground};
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: ${props => props.theme.colors.inputBorder};
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background-color: ${props => props.theme.colors.textTertiary};
  }
`;

export const SelectOption = styled.div<{ isSelected: boolean }>`
  padding: 10px 16px;
  font-size: 14px;
  font-weight: ${props => props.isSelected ? '600' : '500'};
  color: ${props => props.isSelected ? props.theme.colors.white : props.theme.colors.text};
  background-color: ${props => props.isSelected ? props.theme.colors.primary : 'transparent'};
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
  
  &:hover {
    background-color: ${props => props.isSelected ? props.theme.colors.primary : props.theme.colors.surfaceHover};
    color: ${props => props.isSelected ? props.theme.colors.white : props.theme.colors.text};
  }
  
  &:active {
    background-color: ${props => props.theme.colors.purpleDark};
    color: ${props => props.theme.colors.white};
  }
  
  @media (max-width: 768px) {
    padding: 8px 14px;
    font-size: 13px;
  }
  
  @media (max-width: 480px) {
    padding: 8px 12px;
    font-size: 12px;
  }
`;


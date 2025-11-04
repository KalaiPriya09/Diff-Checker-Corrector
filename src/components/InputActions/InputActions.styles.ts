import styled from 'styled-components';

export const ActionButtonsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  
  @media (max-width: 480px) {
    gap: 6px;
  }
`;

export const ActionButton = styled.button`
  background-color: ${props => props.theme.colors.surfaceHover};
  color: ${props => props.theme.colors.text};
  border: 1px solid ${props => props.theme.colors.border};
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
  white-space: nowrap;
  
  &:hover {
    background-color: ${props => props.theme.colors.surface};
    border-color: ${props => props.theme.colors.primary};
    transform: translateY(-1px);
  }
  
  &:active {
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

export const FileInput = styled.input`
  display: none;
`;


import styled from 'styled-components';

export const TabsContainer = styled.div`
  display: flex;
  gap: 4px;
  margin-bottom: 24px;
  border-bottom: 2px solid ${props => props.theme.colors.border};
  padding-bottom: 0;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
  transition: border-color 0.3s ease;
  
  &::-webkit-scrollbar {
    display: none; /* Chrome, Safari, Opera */
  }
  
  @media (max-width: 768px) {
    gap: 2px;
    margin-bottom: 16px;
  }
`;

export const Tab = styled.button<{ isActive: boolean }>`
  padding: 12px 24px;
  border: none;
  background-color: ${props => props.isActive ? props.theme.colors.primary : 'transparent'};
  color: ${props => props.isActive ? props.theme.colors.white : props.theme.colors.textSecondary};
  font-size: 14px;
  font-weight: ${props => props.isActive ? '600' : '400'};
  cursor: pointer;
  border-radius: 8px 8px 0 0;
  transition: all 0.2s;
  position: relative;
  white-space: nowrap;
  flex-shrink: 0;
  
  &:hover {
    background-color: ${props => props.isActive ? props.theme.colors.purpleDark : props.theme.colors.surfaceHover};
    color: ${props => props.isActive ? props.theme.colors.white : props.theme.colors.text};
  }
  
  &:focus {
    outline: 2px solid ${props => props.theme.colors.primary};
    outline-offset: -2px;
  }
  
  @media (max-width: 768px) {
    padding: 10px 16px;
    font-size: 13px;
  }
  
  @media (max-width: 480px) {
    padding: 8px 12px;
    font-size: 12px;
  }
`;
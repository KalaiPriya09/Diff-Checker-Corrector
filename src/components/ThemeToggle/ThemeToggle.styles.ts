import styled from 'styled-components';

export const ThemeToggleButton = styled.button`
  background-color: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: #ffffff;
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  width: 40px;
  height: 40px;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.25);
    border-color: rgba(255, 255, 255, 0.4);
    transform: scale(1.05);
  }
  
  &:active {
    transform: scale(0.98);
  }
  
  @media (max-width: 480px) {
    width: 36px;
    height: 36px;
    padding: 6px;
  }
`;

export const ThemeIcon = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  
  svg {
    width: 100%;
    height: 100%;
  }
`;


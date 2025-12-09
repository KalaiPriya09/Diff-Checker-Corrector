import styled from 'styled-components';

export const ThemeToggleButton = styled.button`
  background: transparent;
  border: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.text};
  padding: 8px;
  border-radius: ${({ theme }) => theme.radii.md};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  width: 40px;
  height: 40px;
  position: relative;
  overflow: hidden;
  
  &:hover {
    background: ${({ theme }) => theme.colors.surfaceHover};
    border-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.primary};
    transform: translateY(-1px);
    box-shadow: 0 4px 12px ${({ theme }) => theme.colors.purpleLight};
  }
  
  &:active {
    transform: translateY(0);
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
  width: 100%;
  height: 100%;
  
  svg {
    width: 20px;
    height: 20px;
    transition: transform 0.5s cubic-bezier(0.4, 0.0, 0.2, 1);
  }

  &:hover svg {
    transform: rotate(180deg);
  }
`;

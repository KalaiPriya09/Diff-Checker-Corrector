import styled from 'styled-components';

export const TextAreaContainer = styled.div`
  display: flex;
  width: 100%;
  position: relative;
  border: 1px solid ${props => props.theme.colors.inputBorder};
  border-radius: 8px;
  overflow: hidden;
  background-color: ${props => props.theme.colors.inputBackground};
  transition: border-color 0.3s ease, background-color 0.3s ease;
  flex: 1;
  min-height: 0;
  max-height: 100%;

  &:focus-within {
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.purpleLight};
  }
`;

export const LineNumbersContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 16px 8px 16px 16px;
  background-color: ${props => props.theme.colors.surface};
  border-right: 1px solid ${props => props.theme.colors.inputBorder};
  overflow-y: hidden;
  overflow-x: hidden;
  user-select: none;
  min-width: 50px;
  text-align: right;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 14px;
  line-height: 1.6;
  transition: background-color 0.3s ease, border-color 0.3s ease;

  @media (max-width: 768px) {
    padding: 12px 6px 12px 12px;
    font-size: 13px;
    min-width: 45px;
  }

  @media (max-width: 480px) {
    padding: 10px 5px 10px 10px;
    font-size: 12px;
    min-width: 40px;
  }
`;

export const LineNumber = styled.div`
  color: ${props => props.theme.colors.textTertiary};
  padding-right: 8px;
  transition: color 0.3s ease;
  height: 1.6em;
  display: flex;
  align-items: center;
  justify-content: flex-end;
`;

export const TextAreaWrapper = styled.div`
  flex: 1;
  position: relative;
  overflow: hidden;
  min-width: 0;
  display: flex;
  border-radius: 0 8px 8px 0;
`;

export const StyledTextArea = styled.textarea<{ $minHeight?: string | number }>`
  flex: 1;
  min-width: 0;
  padding: 16px;
  padding-right: 12px;
  border: none;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 14px;
  resize: vertical;
  line-height: 1.6;
  background-color: transparent;
  color: ${props => props.theme.colors.text};
  transition: color 0.3s ease;
  outline: none;
  box-sizing: border-box;
  overflow-y: auto;
  overflow-x: auto;
  min-height: ${props => {
    if (props.$minHeight) {
      return typeof props.$minHeight === 'number' ? `${props.$minHeight}px` : props.$minHeight;
    }
    return '400px';
  }};
  max-height: 100%;
  
  /* Ensure scrollbar is fully visible and styled - INSIDE the panel */
  scrollbar-width: thin;
  scrollbar-color: ${props => props.theme.colors.inputBorder} ${props => props.theme.colors.inputBackground};
  
  &::-webkit-scrollbar {
    width: 12px;
    height: 12px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${props => props.theme.colors.inputBackground};
    border-radius: 0 8px 8px 0;
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: ${props => props.theme.colors.inputBorder};
    border-radius: 6px;
    border: 2px solid ${props => props.theme.colors.inputBackground};
    background-clip: padding-box;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background-color: ${props => props.theme.colors.textTertiary};
  }
  
  &::-webkit-scrollbar-corner {
    background: ${props => props.theme.colors.inputBackground};
  }
  
  &::placeholder {
    color: ${props => props.theme.colors.textTertiary};
  }
  
  @media (max-width: 768px) {
    padding: 12px;
    font-size: 13px;
    min-height: ${props => {
      if (props.$minHeight) {
        const baseHeight = typeof props.$minHeight === 'number' ? props.$minHeight : parseInt(props.$minHeight);
        return `${Math.max(250, baseHeight - 100)}px`;
      }
      return '300px';
    }};
  }
  
  @media (max-width: 480px) {
    padding: 10px;
    font-size: 12px;
    min-height: ${props => {
      if (props.$minHeight) {
        const baseHeight = typeof props.$minHeight === 'number' ? props.$minHeight : parseInt(props.$minHeight);
        return `${Math.max(200, baseHeight - 150)}px`;
      }
      return '250px';
    }};
  }
`;


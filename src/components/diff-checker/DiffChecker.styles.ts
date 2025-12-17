import styled, { css, keyframes } from 'styled-components';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const glassMixin = css`
  background: ${({ theme }) => theme.colors.surface};
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid ${({ theme }) => theme.colors.glassBorder};
  box-shadow: ${({ theme }) => theme.shadows.md};
`;

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100%;
  color: ${({ theme }) => theme.colors.text};
  animation: ${fadeIn} 0.4s ease-out;
`;

export const ToggleGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    gap: 16px;
  }
  
  @media (max-width: 480px) {
    display: flex;
    flex-direction: column;
    gap: 0;
    width: 100%;
    background: ${({ theme }) => theme.colors.inputBackground};
    border-radius: 12px;
    padding: 4px 0;
    border: 1px solid ${({ theme }) => theme.colors.border};
  }
`;

export const ToggleLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};
  cursor: pointer;
  user-select: none;
  transition: color 0.2s;
  
  @media (max-width: 768px) {
    font-size: 13px;
    gap: 8px;
  }
  
  @media (max-width: 480px) {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    padding: 14px 16px;
    font-size: 14px;
    gap: 12px;
    color: ${({ theme }) => theme.colors.text};
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
    
    &:last-child {
      border-bottom: none;
    }
    
    /* Label text on left */
    span {
      order: -1;
      flex: 1;
      text-align: left;
    }
    
    /* Toggle switch on right */
    input[type="checkbox"] {
      order: 1;
      flex-shrink: 0;
    }
  }

  &:hover {
    color: ${({ theme }) => theme.colors.text};
  }
`;

export const ToggleSwitch = styled.input.attrs({ type: 'checkbox' })`
  width: 44px;
  height: 24px;
  appearance: none;
  background-color: ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);

  &:checked {
    background-color: #C084FC;
    box-shadow: 0 0 10px #C084FC;
  }

  &:before {
    content: '';
    position: absolute;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background-color: #ffffff;
    top: 2px;
    left: 2px;
    transition: transform 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  &:checked:before {
    transform: translateX(20px);
  }
`;

export const Select = styled.select`
  padding: 8px 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.sm};
  font-size: 14px;
  background-color: ${({ theme }) => theme.colors.inputBackground};
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  outline: none;
  transition: all 0.2s;

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.purpleLight};
  }
`;

export const MainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
  ${glassMixin}
  border-radius: ${({ theme }) => theme.radii.lg};
  width: 100%;
  min-height: 0;
  margin-top: 16px;
  
  @media (max-width: 768px) {
    margin-top: 20px;
  }
  
  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 10px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.border};
    border-radius: 5px;
  }
`;

export const OptionsSection = styled.div`
  padding: 20px 32px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surfaceHover};
  
  @media (max-width: 1024px) {
    padding: 18px 24px;
  }
  
  @media (max-width: 768px) {
    padding: 16px 20px;
  }
  
  @media (max-width: 480px) {
    padding: 12px 16px;
  }
`;

export const OptionsHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
`;

export const OptionsTitle = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  display: flex;
  align-items: center;
  gap: 10px;
  
  @media (max-width: 768px) {
    font-size: 16px;
    gap: 8px;
  }
  
  @media (max-width: 480px) {
    font-size: 14px;
    gap: 6px;
  }
  
  &::before {
    content: '';
    display: block;
    width: 4px;
    height: 24px;
    background: linear-gradient(180deg, #FF4BFF 0%, #C084FC 100%);
    border-radius: 999px;
    box-shadow: 0 0 10px rgba(255, 75, 255, 0.7);
    
    @media (max-width: 480px) {
      height: 20px;
      width: 3px;
    }
  }
`;

export const OptionsContent = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    gap: 16px;
  }
  
  @media (max-width: 480px) {
    gap: 0;
    flex-direction: column;
    align-items: stretch;
    width: 100%;
  }
`;

export const CommonButtons = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    gap: 8px;
  }
  
  @media (max-width: 480px) {
    width: 100%;
    justify-content: flex-start;
    gap: 6px;
    flex-wrap: wrap;
  }
`;

export const ActionButtons = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-right: 24px;
  flex-wrap: wrap;
  
  @media (max-width: 1024px) {
    margin-right: 16px;
    gap: 10px;
  }
  
  @media (max-width: 768px) {
    margin-right: 0;
    gap: 8px;
    width: 100%;
    justify-content: flex-start;
  }
  
  @media (max-width: 480px) {
    flex-direction: column;
    width: 100%;
    gap: 8px;
  }
`;

export const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: transparent;
  color: ${({ theme }) => theme.colors.text};
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: ${({ theme }) => theme.fonts.body};

  @media (max-width: 768px) {
    padding: 8px 12px;
    font-size: 12px;
  }
  
  @media (max-width: 480px) {
    padding: 8px;
    width: auto;
    justify-content: center;
    
    span {
      display: none;
    }
  }

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

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  svg {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
  }
`;

export const HiddenFileInput = styled.input`
  display: none;
`;

export const InputSection = styled.div`
  display: flex;
  gap: 24px;
  padding: 32px;
  
  @media (max-width: 1024px) {
    flex-direction: column;
    padding: 24px;
    gap: 20px;
  }
  
  @media (max-width: 768px) {
    padding: 20px;
    gap: 16px;
  }
  
  @media (max-width: 480px) {
    padding: 16px;
    gap: 12px;
  }
`;

export const InputPanelWrapper = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 12px;
`;

export const InputPanel = styled.div<{ $isDragOver?: boolean }>`
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 500px;
  min-height: 500px;
  background-color: ${({ theme }) => theme.colors.inputBackground};
  border: 2px dashed ${({ theme, $isDragOver }) =>
    $isDragOver ? theme.colors.primary : theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  overflow: hidden;
  transition: all 0.3s ease;
  position: relative;
  
  @media (max-width: 1024px) {
    height: 400px;
    min-height: 400px;
  }
  
  @media (max-width: 768px) {
    height: 350px;
    min-height: 350px;
  }
  
  @media (max-width: 480px) {
    height: 300px;
    min-height: 300px;
  }
  
  ${({ $isDragOver, theme }) => $isDragOver && css`
    background-color: ${theme.colors.purpleLight};
    transform: scale(1.01);
  `}
`;

export const DragOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: ${({ theme }) => theme.colors.purpleMedium};
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  
  div {
    font-size: 18px;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.primary};
    padding: 24px 40px;
    background: ${({ theme }) => theme.colors.surface};
    border-radius: ${({ theme }) => theme.radii.lg};
    box-shadow: ${({ theme }) => theme.shadows.floating};
    border: 2px solid ${({ theme }) => theme.colors.primary};
  }
`;

export const PanelHeader = styled.div`
  padding: 12px 20px;
  background: ${({ theme }) => theme.colors.surfaceHover};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 13px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  @media (max-width: 768px) {
    padding: 10px 16px;
    font-size: 12px;
  }
  
  @media (max-width: 480px) {
    padding: 8px 12px;
    font-size: 11px;
  }
`;

export const PanelActions = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  
  @media (max-width: 480px) {
    gap: 6px;
  }
`;

export const IconButton = styled.button`
  padding: 6px;
  border: none;
  background: transparent;
  color: ${({ theme }) => theme.colors.textSecondary};
  cursor: pointer;
  border-radius: ${({ theme }) => theme.radii.sm};
  transition: all 0.2s;
  
  @media (max-width: 480px) {
    padding: 4px;
  }

  &:hover {
    background: ${({ theme }) => theme.colors.surfaceHover};
    color: ${({ theme }) => theme.colors.primary};
  }
`;

export const TextAreaContainer = styled.div`
  flex: 1;
  position: relative;
  overflow: hidden;
  display: flex;
`;

export const TextArea = styled.textarea`
  flex: 1;
  width: 100%;
  padding: 20px;
  border: none;
  font-size: 14px;
  font-family: 'JetBrains Mono', 'Fira Code', 'Monaco', monospace;
  background: transparent;
  color: ${({ theme }) => theme.colors.text};
  resize: none;
  outline: none;
  line-height: 1.6;
  white-space: pre-wrap;
  
  @media (max-width: 768px) {
    padding: 16px;
    font-size: 13px;
  }
  
  @media (max-width: 480px) {
    padding: 12px;
    font-size: 12px;
    line-height: 1.5;
  }
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.textTertiary};
  }

  &::-webkit-scrollbar {
    width: 10px;
    
    @media (max-width: 480px) {
      width: 8px;
    }
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.border};
    border-radius: 5px;
    border: 2px solid transparent;
    background-clip: content-box;
    
    &:hover {
      background-color: ${({ theme }) => theme.colors.textSecondary};
    }
  }
`;

export const PanelFooter = styled.div`
  padding: 10px 20px;
  background: ${({ theme }) => theme.colors.surfaceHover};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textTertiary};
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  @media (max-width: 768px) {
    padding: 8px 16px;
    font-size: 11px;
    flex-wrap: wrap;
    gap: 8px;
  }
  
  @media (max-width: 480px) {
    padding: 6px 12px;
    font-size: 10px;
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
`;

export const ErrorMessage = styled.div`
  padding: 12px 16px;
  background: ${({ theme }) => theme.colors.diffRemovedBg};
  border: 1px solid ${({ theme }) => theme.colors.diffRemovedText};
  color: ${({ theme }) => theme.colors.diffRemovedText};
  font-size: 13px;
  margin-top: 12px;
  border-radius: ${({ theme }) => theme.radii.md};
  display: flex;
  align-items: center;
  gap: 8px;
  
  @media (max-width: 768px) {
    padding: 10px 14px;
    font-size: 12px;
    margin-top: 10px;
    gap: 6px;
  }
  
  @media (max-width: 480px) {
    padding: 8px 12px;
    font-size: 11px;
    margin-top: 8px;
    gap: 6px;
    flex-wrap: wrap;
  }
`;

export const SuccessMessage = styled.div`
  padding: 12px 16px;
  background: ${({ theme }) => theme.colors.diffAddedBg};
  border: 1px solid ${({ theme }) => theme.colors.diffAddedText};
  color: ${({ theme }) => theme.colors.diffAddedText};
  font-size: 13px;
  margin-top: 12px;
  border-radius: ${({ theme }) => theme.radii.md};
  
  @media (max-width: 768px) {
    padding: 10px 14px;
    font-size: 12px;
    margin-top: 10px;
  }
  
  @media (max-width: 480px) {
    padding: 8px 12px;
    font-size: 11px;
    margin-top: 8px;
  }
`;

export const NoDifferencesMessage = styled.div`
  padding: 24px 32px;
  margin: 32px;
  background: ${({ theme }) => theme.colors.diffAddedBg};
  border: 1px dashed ${({ theme }) => theme.colors.diffAddedText};
  border-radius: ${({ theme }) => theme.radii.lg};
  color: ${({ theme }) => theme.colors.diffAddedText};
  font-size: 18px;
  font-weight: 500;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 12px;
  text-align: center;
  
  @media (max-width: 768px) {
    padding: 20px 24px;
    margin: 24px;
    font-size: 16px;
    gap: 10px;
  }
  
  @media (max-width: 480px) {
    padding: 16px;
    margin: 16px;
    font-size: 14px;
    gap: 8px;
  }
  
  &::before {
    content: '✓';
    font-size: 24px;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255,255,255,0.3);
    border-radius: 50%;
    flex-shrink: 0;
    
    @media (max-width: 768px) {
      font-size: 20px;
      width: 36px;
      height: 36px;
    }
    
    @media (max-width: 480px) {
      font-size: 18px;
      width: 32px;
      height: 32px;
    }
  }
`;

export const ComparisonSection = styled.div`
  flex: 1;
  display: flex;
  gap: 24px;
  padding: 32px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  
  @media (max-width: 1024px) {
    flex-direction: column;
    padding: 24px;
    gap: 20px;
  }
  
  @media (max-width: 768px) {
    padding: 20px;
    gap: 16px;
  }
  
  @media (max-width: 480px) {
    padding: 16px;
    gap: 12px;
  }
`;

export const DiffPanel = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  height: auto;
  min-height: 100px;
  max-height: 600px;
  background: ${({ theme }) => theme.colors.inputBackground};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  overflow: hidden;
  box-shadow: ${({ theme }) => theme.shadows.sm};
  
  @media (max-width: 1024px) {
    height: auto;
    min-height: 100px;
    max-height: 500px;
  }
  
  @media (max-width: 768px) {
    height: auto;
    min-height: 100px;
    max-height: 400px;
  }
  
  @media (max-width: 480px) {
    height: auto;
    min-height: 100px;
    max-height: 350px;
  }
`;

export const DiffHeader = styled.div`
  padding: 12px 20px;
  background: ${({ theme }) => theme.colors.surfaceHover};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  font-size: 13px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  @media (max-width: 768px) {
    padding: 10px 16px;
    font-size: 12px;
  }
  
  @media (max-width: 480px) {
    padding: 8px 12px;
    font-size: 11px;
  }
`;

export const DiffContent = styled.div`
  flex: 1;
  overflow: auto;
  font-family: 'JetBrains Mono', 'Fira Code', 'Monaco', monospace;
  font-size: 13px;
  line-height: 1.6;
  
  @media (max-width: 768px) {
    font-size: 12px;
    line-height: 1.5;
  }
  
  @media (max-width: 480px) {
    font-size: 11px;
    line-height: 1.4;
  }
  
  &::-webkit-scrollbar {
    width: 10px;
    height: 10px;
    
    @media (max-width: 480px) {
      width: 8px;
      height: 8px;
    }
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.border};
    border-radius: 5px;
    border: 2px solid transparent;
    background-clip: content-box;
    
    &:hover {
      background-color: ${({ theme }) => theme.colors.textSecondary};
    }
  }
`;

export const DiffLine = styled.div<{ type: string; $isWordMode?: boolean }>`
  padding: 0 12px;
  padding-left: 60px;
  display: flex;
  align-items: flex-start;
  gap: 8px;
  white-space: pre;
  word-break: normal;
  position: relative;
  min-height: 24px;
  
  @media (max-width: 768px) {
    padding: 0 10px;
    padding-left: 50px;
    gap: 6px;
    font-size: 12px;
  }
  
  @media (max-width: 480px) {
    padding: 0 8px;
    padding-left: 45px;
    gap: 4px;
    font-size: 11px;
    min-height: 22px;
    white-space: pre-wrap;
    word-break: break-word;
  }
  
  ${({ type, theme, $isWordMode }) => {
    if ($isWordMode) return css`
      background: transparent;
      color: ${theme.colors.text};
      border-left: none;
    `;

    switch (type) {
      case 'added':
        return css`
          background-color: rgba(16, 185, 129, 0.1);
          color: ${theme.colors.text};
          border-left: 3px solid #10B981;
        `;
      case 'removed':
        return css`
          background-color: rgba(239, 68, 68, 0.1);
          color: ${theme.colors.text};
          border-left: 3px solid #EF4444;
        `;
      case 'changed':
        return css`
          background-color: rgba(245, 158, 11, 0.15);
          color: ${theme.colors.text};
          border-left: 3px solid #F59E0B;
        `;
      default:
        return css`
          color: ${theme.colors.text};
          border-left: 3px solid transparent;
        `;
    }
  }}
`;

export const DiffLineNumber = styled.span<{ type?: string }>`
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 48px;
  padding-right: 12px;
  text-align: right;
  color: ${({ theme, type }) => {
    switch (type) {
      case 'added': return '#10B981';
      case 'removed': return '#EF4444';
      case 'changed': return '#F59E0B';
      default: return theme.colors.textTertiary;
    }
  }};
  background: ${({ theme, type }) => {
    switch (type) {
      case 'added': return 'rgba(16, 185, 129, 0.1)';
      case 'removed': return 'rgba(239, 68, 68, 0.1)';
      case 'changed': return 'rgba(245, 158, 11, 0.15)';
      default: return theme.colors.surfaceHover;
    }
  }};
  border-right: 1px solid ${({ theme, type }) => {
    switch (type) {
      case 'added': return 'rgba(16, 185, 129, 0.2)';
      case 'removed': return 'rgba(239, 68, 68, 0.2)';
      case 'changed': return 'rgba(245, 158, 11, 0.2)';
      default: return theme.colors.border;
    }
  }};
  user-select: none;
  font-size: 11px;
  line-height: 24px;
  
  @media (max-width: 768px) {
    width: 42px;
    padding-right: 10px;
    font-size: 10px;
    line-height: 22px;
  }
  
  @media (max-width: 480px) {
    width: 38px;
    padding-right: 8px;
    font-size: 9px;
    line-height: 22px;
  }
`;

export const DiffLineContent = styled.span<{ type?: string; $isWordMode?: boolean }>`
  padding: 2px 0;
  width: 100%;
  text-decoration: none;
  color: ${({ theme, type, $isWordMode }) => {
    // In Word Mode, don't apply line-level colors - let WordHighlight handle it
    if ($isWordMode) return theme.colors.text;
    
    switch (type) {
      case 'added': return '#10B981';
      case 'removed': return '#EF4444';
      case 'changed': return '#F59E0B';
      default: return 'inherit';
    }
  }};
`;

export const WordHighlight = styled.span<{ $type: 'added' | 'removed' | 'modified' | 'unchanged' }>`
  ${({ $type, theme }) => {
    switch ($type) {
      case 'added':
        return css`
          background-color: rgba(16, 185, 129, 0.1);
          color: ${theme.colors.diffAddedText};
          // border-radius: 2px;
          // padding: 0 2px;
        `;
      case 'removed':
        return css`
          background-color: rgba(239, 68, 68, 0.1);
          color:  ${theme.colors.diffRemovedText};
          // border-radius: 2px;
          // padding: 0 2px;
          // text-decoration: line-through;
        `;
      case 'modified':
        return css`
          background-color: rgba(245, 158, 11, 0.15);
          color: ${theme.colors.diffChangedText};
          // border-radius: 2px;
          // padding: 0 2px;
        `;
      default:
        return '';
    }
  }}
`;

export const SummaryBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 32px;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.glassBorder};
  border-radius: ${({ theme }) => theme.radii.lg};
  margin-bottom: 24px;
  box-shadow: ${({ theme }) => theme.shadows.md};
  
  @media (max-width: 1024px) {
    padding: 18px 24px;
    margin-bottom: 20px;
  }
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 16px;
    padding: 16px;
    margin-bottom: 16px;
    align-items: flex-start;
  }
  
  @media (max-width: 480px) {
    padding: 12px;
    gap: 12px;
    margin-bottom: 12px;
  }
`;

export const SummaryTitle = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  display: flex;
  align-items: center;
  gap: 10px;
  
  @media (max-width: 768px) {
    font-size: 14px;
    gap: 8px;
  }
  
  @media (max-width: 480px) {
    font-size: 13px;
    gap: 6px;
  }
  
  &::before {
    content: '';
    display: block;
    width: 4px;
    height: 24px;
    background: linear-gradient(180deg, #FF4BFF 0%, #C084FC 100%);
    border-radius: 999px;
    box-shadow: 0 0 10px rgba(255, 75, 255, 0.7);
    
    @media (max-width: 480px) {
      height: 20px;
      width: 3px;
    }
  }
`;

export const SummaryStats = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;
  
  @media (max-width: 1024px) {
    gap: 20px;
  }
  
  @media (max-width: 768px) {
    gap: 16px;
    flex-wrap: wrap;
    width: 100%;
    justify-content: flex-start;
  }
  
  @media (max-width: 480px) {
    gap: 12px;
    flex-direction: column;
    width: 100%;
    align-items: flex-start;
  }
`;

export const DifferencesBadge = styled.div`
  padding: 6px 16px;
  background: rgba(168, 85, 247, 0.18);   /* pill bg */
  color: #EA7BFF;                         /* text */
  border: 1px solid #EA7BFF;              /* border */
  border-radius: ${({ theme }) => theme.radii.full};
  font-size: 13px;
  font-weight: 600;
  box-shadow: 0 0 15px rgba(168, 85, 247, 0.35);
  display: flex;
  align-items: center;
  gap: 8px;
  
  @media (max-width: 768px) {
    padding: 5px 12px;
    font-size: 12px;
    gap: 6px;
  }
  
  @media (max-width: 480px) {
    padding: 4px 10px;
    font-size: 11px;
    gap: 5px;
  }
  
  &::before {
    content: '';
    display: block;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background-color: #FF7BFF;           /* dot */
    box-shadow: 0 0 8px #FF7BFF;
    
    @media (max-width: 480px) {
      width: 5px;
      height: 5px;
    }
  }
`;

export const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  min-width: 80px;
  
  @media (max-width: 768px) {
    min-width: 70px;
  }
  
  @media (max-width: 480px) {
    min-width: auto;
    width: 100%;
    align-items: flex-start;
    flex-direction: row;
    justify-content: space-between;
  }
`;

export const StatLabel = styled.span`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const StatValue = styled.span<{ type?: 'added' | 'removed' | 'changed' }>`
  font-weight: 700;
  font-size: 20px;
  color: ${({ theme, type }) => {
    switch (type) {
      case 'added': return '#10B981';
      case 'removed': return '#EF4444';
      case 'changed': return '#F59E0B';
      default: return theme.colors.text;
    }
  }};
  text-shadow: 0 0 10px ${({ theme, type }) => {
    switch (type) {
      case 'added': return 'rgba(16, 185, 129, 0.3)';
      case 'removed': return 'rgba(239, 68, 68, 0.3)';
      case 'changed': return 'rgba(245, 158, 11, 0.3)';
      default: return 'none';
    }
  }};
  
  @media (max-width: 768px) {
    font-size: 18px;
  }
  
  @media (max-width: 480px) {
    font-size: 16px;
  }
`;

export const StatusText = styled.span<{ type?: 'error' | 'success' }>`
  color: ${({ theme, type }) => {
    if (type === 'error') return theme.colors.error;
    if (type === 'success') return theme.colors.success;
    return theme.colors.textSecondary;
  }};
  font-size: 13px;
  font-weight: 500;
`;

export const ClearIcon = styled.span`
  font-size: 16px;
  display: flex;
  align-items: center;
`;
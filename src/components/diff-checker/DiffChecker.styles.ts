import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100%; /* Allow growth beyond parent height */
  background-color: transparent;
  color: ${(props) => props.theme.colors.text};
  padding-top: 0; /* Will be handled by ContentContainer in index.tsx */
`;

export const ToggleGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    gap: 12px;
  }
`;

export const ToggleLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: ${(props) => props.theme.colors.text};
  cursor: pointer;
  user-select: none;
  
  @media (max-width: 768px) {
    font-size: 13px;
    gap: 6px;
  }
  
  @media (max-width: 480px) {
    font-size: 10px;
  }
`;

export const ToggleSwitch = styled.input.attrs({ type: 'checkbox' })`
  width: 44px;
  height: 24px;
  appearance: none;
  background-color: ${(props) => props.theme.colors.border};
  border-radius: 12px;
  position: relative;
  cursor: pointer;
  transition: background-color 0.2s;

  &:checked {
    background-color: ${(props) => props.theme.colors.purple};
  }

  &:before {
    content: '';
    position: absolute;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background-color: ${(props) => props.theme.colors.white};
    top: 2px;
    left: 2px;
    transition: transform 0.2s;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  &:checked:before {
    transform: translateX(20px);
  }
`;

export const Select = styled.select`
  padding: 8px 12px;
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: ${(props) => props.theme.radii.sm};
  font-size: 14px;
  background-color: ${(props) => props.theme.colors.white};
  color: ${(props) => props.theme.colors.text};
  cursor: pointer;
  outline: none;

  &:focus {
    border-color: ${(props) => props.theme.colors.purple};
    box-shadow: 0 0 0 3px ${(props) => props.theme.colors.purpleLight};
  }

  option {
    background-color: ${(props) => props.theme.colors.white};
    color: ${(props) => props.theme.colors.text};
  }
  
  @media (max-width: 768px) {
    padding: 6px 10px;
    font-size: 13px;
  }
  
  @media (max-width: 480px) {
    padding: 6px 8px;
    font-size: 12px;
  }
`;

export const MainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
  background-color: ${(props) => props.theme.colors.background};
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: ${props => props.theme.radii.md};
  width: 100%;
  min-height: 0; /* Allow flex item to shrink below content size */
  
  /* Hide scrollbar initially, show only when scrolling */
  scrollbar-width: thin; /* Firefox */
  scrollbar-color: transparent transparent; /* Firefox - hide initially */
  
  &::-webkit-scrollbar {
    width: 12px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: transparent;
    border-radius: 6px;
    transition: background 0.3s ease;
  }

  /* Show scrollbar on hover or when scrolling */
  &:hover::-webkit-scrollbar-thumb,
  &:active::-webkit-scrollbar-thumb {
    background: ${(props) => props.theme.colors.border};
  }

  &:hover::-webkit-scrollbar-track,
  &:active::-webkit-scrollbar-track {
    background: ${(props) => props.theme.colors.surface};
  }
`;

export const OptionsSection = styled.div`
  background-color: ${(props) => props.theme.colors.surface};
  border-bottom: 1px solid ${(props) => props.theme.colors.border};
  padding: 16px 24px;
  
  @media (max-width: 1024px) {
    padding: 14px 20px;
  }
  
  @media (max-width: 768px) {
    padding: 12px 16px;
  }
`;

export const OptionsHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    margin-bottom: 12px;
  }
`;

export const OptionsTitle = styled.h3`
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: ${(props) => props.theme.colors.text};
  
  @media (max-width: 768px) {
    font-size: 14px;
  }
  
  @media (max-width: 480px) {
    font-size: 13px;
  }
`;

export const OptionsContent = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
  
  @media (max-width: 1024px) {
    gap: 16px;
  }
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
`;

export const CommonButtons = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
    flex-wrap: wrap;
  
  @media (max-width: 768px) {
    width: 100%;
    justify-content: flex-start;
  }
`;

export const ActionButtons = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-right: 16px;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    margin-right: 0;
    width: 100%;
    justify-content: flex-start;
  }
`;

export const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border: 1px solid ${(props) => props.theme.colors.border};
  background-color: ${(props) => props.theme.colors.surface};
  color: ${(props) => props.theme.colors.text};
  border-radius: ${(props) => props.theme.radii.sm};
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: ${(props) => props.theme.fonts.body};

  &:hover:not(:disabled) {
    background-color: ${(props) => props.theme.colors.surfaceHover};
    border-color: ${(props) => props.theme.colors.primary};
    color: ${(props) => props.theme.colors.primary};
  }

  &:active:not(:disabled) {
    transform: translateY(1px);
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
  
  @media (max-width: 768px) {
    font-size: 12px;
    padding: 6px 10px;
    
    svg {
      width: 14px;
      height: 14px;
    }
  }

  @media (max-width: 480px) {
    padding: 8px;
    gap: 0;
    min-width: 40px;
    justify-content: center;
    
    span {
      display: none;
    }
    
    svg {
      width: 18px;
      height: 18px;
    }
  }
`;

export const HiddenFileInput = styled.input`
  display: none;
`;

export const InputSection = styled.div`
  display: flex;
  gap: 16px;
  padding: 24px;
  background-color: ${(props) => props.theme.colors.background};
  
  @media (max-width: 1024px) {
    flex-direction: column;
    padding: 20px;
    gap: 16px;
  }
  
  @media (max-width: 768px) {
    flex-direction: column;
    padding: 16px;
    gap: 16px;
  }
  
  @media (max-width: 480px) {
    padding: 12px;
    gap: 12px;
  }
`;

export const InputPanelWrapper = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

export const InputPanel = styled.div<{ $isDragOver?: boolean }>`
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 520px;
  min-height: 520px;
  max-height: 520px;
  background-color: ${(props) => props.theme.colors.surface};
  border: 2px dashed ${(props) => 
    props.$isDragOver 
      ? props.theme.colors.primary 
      : props.theme.colors.border};
  border-radius: ${(props) => props.theme.radii.md};
  overflow: hidden;
  box-shadow: ${(props) => 
    props.$isDragOver 
      ? `0 0 0 4px ${props.theme.colors.purpleLight}` 
      : '0 1px 3px rgba(0, 0, 0, 0.1)'};
  transition: all 0.2s ease;
  position: relative;
  
  ${(props) => props.$isDragOver && `
    background-color: ${props.theme.colors.purpleLight};
  `}
  
  @media (max-width: 1024px) {
    height: 450px;
    min-height: 450px;
    max-height: 450px;
  }
  
  @media (max-width: 768px) {
    height: 400px;
    min-height: 400px;
    max-height: 400px;
  }
  
  @media (max-width: 480px) {
    height: 350px;
    min-height: 350px;
    max-height: 350px;
  }
`;

export const DragOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${(props) => props.theme.colors.purpleMedium};
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  border-radius: ${(props) => props.theme.radii.md};
  
  div {
    font-size: 18px;
    font-weight: 600;
    color: ${(props) => props.theme.colors.primary};
    text-align: center;
    padding: 20px;
    background-color: ${(props) => props.theme.colors.white};
    border-radius: ${(props) => props.theme.radii.sm};
    box-shadow: ${(props) => props.theme.shadows.lg};
    border: 2px solid ${(props) => props.theme.colors.primary};
  }
`;

export const PanelHeader = styled.div`
  padding: 12px 16px;
  background-color: ${(props) => props.theme.colors.surfaceHover};
  border-bottom: 1px solid ${(props) => props.theme.colors.border};
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  font-weight: 600;
  color: ${(props) => props.theme.colors.text};
  text-transform: uppercase;
  
  @media (max-width: 768px) {
    padding: 10px 12px;
    font-size: 12px;
  }
`;

export const PanelActions = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

export const IconButton = styled.button`
  padding: 4px 8px;
  border: none;
  background: transparent;
  color: ${(props) => props.theme.colors.textSecondary};
  cursor: pointer;
  font-size: 14px;
  border-radius: ${(props) => props.theme.radii.sm};
  transition: background-color 0.2s;

  &:hover {
    background-color: ${(props) => props.theme.colors.surfaceHover};
  }

  &:active {
    background-color: ${(props) => props.theme.colors.border};
  }
`;

export const TextAreaContainer = styled.div`
  flex: 1;
  position: relative;
  overflow-y: auto;
  overflow-x: hidden;
  min-height: 0;
  display: flex;
`;

export const TextArea = styled.textarea`
  flex: 1;
  width: 100%;
  min-height: 0;
  padding: 12px 16px;
  border: none;
  font-size: 14px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
  background-color: ${(props) => props.theme.colors.inputBackground};
  color: ${(props) => props.theme.colors.text};
  resize: none;
  outline: none;
  line-height: 1.6;
  white-space: pre-wrap;
  overflow-wrap: break-word;
  overflow-x: hidden;
  overflow-y: auto;
  tab-size: 2;
  
  @media (max-width: 768px) {
    padding: 10px 12px;
    font-size: 13px;
  }
  
  @media (max-width: 480px) {
    padding: 8px 10px;
    font-size: 12px;
  }

  scrollbar-width: thin;
  scrollbar-color: ${(props) => props.theme.colors.border} ${(props) => props.theme.colors.surface};

  &::placeholder {
    color: ${(props) => props.theme.colors.textTertiary};
  }

  &::-webkit-scrollbar {
    width: 12px;
  }

  &::-webkit-scrollbar-track {
    background: ${(props) => props.theme.colors.surface};
    border-radius: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background: ${(props) => props.theme.colors.border};
    border-radius: 6px;
    border: 2px solid ${(props) => props.theme.colors.surface};
  }

  &::-webkit-scrollbar-thumb:hover {
    background: ${(props) => props.theme.colors.textTertiary};
  }
`;

export const PanelFooter = styled.div`
  padding: 8px 16px;
  background-color: ${(props) => props.theme.colors.surfaceHover};
  border-top: 1px solid ${(props) => props.theme.colors.border};
  font-size: 12px;
  color: ${(props) => props.theme.colors.textSecondary};
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    padding: 6px 12px;
    font-size: 11px;
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
`;

export const ErrorMessage = styled.div`
  padding: 8px 12px;
  background-color: ${(props) => props.theme.colors.diffRemovedBg};
  border: 1px solid ${(props) => props.theme.colors.diffRemovedText};
  color: ${(props) => props.theme.colors.diffRemovedText};
  font-size: 12px;
  margin-top: 8px;
  border-radius: ${(props) => props.theme.radii.sm};
  
  @media (max-width: 768px) {
    padding: 6px 10px;
    font-size: 11px;
  }
  
  @media (max-width: 480px) {
    padding: 6px 8px;
    font-size: 10px;
  }
`;

export const SuccessMessage = styled.div`
  padding: 8px 12px;
  background-color: ${(props) => props.theme.colors.diffAddedBg};
  border: 1px solid ${(props) => props.theme.colors.diffAddedText};
  color: ${(props) => props.theme.colors.diffAddedText};
  font-size: 12px;
  margin-top: 8px;
  border-radius: ${(props) => props.theme.radii.sm};
  
  @media (max-width: 768px) {
    padding: 6px 10px;
    font-size: 11px;
  }
  
  @media (max-width: 480px) {
    padding: 6px 8px;
    font-size: 10px;
  }
`;

export const NoDifferencesMessage = styled.div`
  padding: 24px;
  margin: 24px;
  background-color: ${(props) => props.theme.colors.diffAddedBg};
  border: 1px solid ${(props) => props.theme.colors.diffAddedText};
  border-radius: ${(props) => props.theme.radii.md};
  color: ${(props) => props.theme.colors.diffAddedText};
  font-size: 16px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 12px;
  text-align: center;
  justify-content: center;
  
  &::before {
    content: '✓';
    font-size: 24px;
    font-weight: bold;
  }
  
  @media (max-width: 768px) {
    padding: 20px;
    margin: 16px;
    font-size: 14px;
    gap: 10px;
    
    &::before {
      font-size: 20px;
    }
  }
  
  @media (max-width: 480px) {
    padding: 16px;
    margin: 12px;
    font-size: 13px;
    gap: 8px;
    flex-direction: column;
    
    &::before {
      font-size: 18px;
    }
  }
`;

export const ComparisonSection = styled.div`
  flex: 1;
  display: flex;
  gap: 16px;
  padding: 24px;
  background-color: ${(props) => props.theme.colors.background};
  overflow: hidden;
  
  @media (max-width: 1024px) {
    flex-direction: column;
    padding: 20px;
    gap: 16px;
  }
  
  @media (max-width: 768px) {
    flex-direction: column;
    padding: 16px;
    gap: 16px;
  }
  
  @media (max-width: 480px) {
    padding: 12px;
    gap: 12px;
  }
`;

export const DiffPanel = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 650px;
  min-height: 650px;
  max-height: 650px;
  background-color: ${(props) => props.theme.colors.surface};
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: ${(props) => props.theme.radii.md};
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  
  @media (max-width: 1024px) {
    height: 550px;
    min-height: 550px;
    max-height: 550px;
  }
  
  @media (max-width: 768px) {
    height: 500px;
    min-height: 500px;
    max-height: 500px;
    width: 100%;
  }
  
  @media (max-width: 480px) {
    height: 450px;
    min-height: 450px;
    max-height: 450px;
  }
`;

export const DiffHeader = styled.div`
  padding: 12px 16px;
  background-color: ${(props) => props.theme.colors.surfaceHover};
  border-bottom: 1px solid ${(props) => props.theme.colors.border};
  font-size: 14px;
  font-weight: 600;
  color: ${(props) => props.theme.colors.text};
  text-transform: uppercase;
  
  @media (max-width: 768px) {
    padding: 10px 12px;
    font-size: 12px;
  }
`;

export const DiffContent = styled.div`
  flex: 1;
  overflow-y: auto;
  overflow-x: auto;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
  font-size: 13px;
  line-height: 1.6;
  min-height: 0;
  
  @media (max-width: 768px) {
    font-size: 12px;
  }
  
  @media (max-width: 480px) {
    font-size: 11px;
  }

  scrollbar-width: thin;
  scrollbar-color: ${(props) => props.theme.colors.border} ${(props) => props.theme.colors.surface};

  &::-webkit-scrollbar {
    width: 12px;
  }

  &::-webkit-scrollbar-track {
    background: ${(props) => props.theme.colors.surface};
    border-radius: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background: ${(props) => props.theme.colors.border};
    border-radius: 6px;
    border: 2px solid ${(props) => props.theme.colors.surface};
  }

  &::-webkit-scrollbar-thumb:hover {
    background: ${(props) => props.theme.colors.textTertiary};
  }
`;

export const DiffLine = styled.div<{ type: string; $isWordMode?: boolean }>`
  padding: 2px 12px;
  padding-left: 60px;
  display: flex;
  align-items: flex-start;
  gap: 8px;
  white-space: pre;
  word-break: normal;
  position: relative;
  min-height: 20px;
  
  @media (max-width: 768px) {
    padding: 2px 8px;
    padding-left: 50px;
    gap: 6px;
    min-height: 18px;
  }
  
  @media (max-width: 480px) {
    padding: 2px 6px;
    padding-left: 45px;
    gap: 4px;
    min-height: 16px;
  }

  ${(props) => {
    // In Word Mode, use neutral background - only words are highlighted
    if (props.$isWordMode) {
      return `
        background-color: ${props.theme.colors.surface};
        color: ${props.theme.colors.text};
      `;
    }
    
    // Line Mode - apply line-level background colors
    switch (props.type) {
      case 'added':
        return `
          background-color: ${props.theme.colors.diffAddedBg};
          color: ${props.theme.colors.diffAddedText};
        `;
      case 'removed':
        return `
          background-color: ${props.theme.colors.diffRemovedBg};
          color: ${props.theme.colors.diffRemovedText};
        `;
      case 'changed':
        return `
          background-color: ${props.theme.colors.diffModifiedBg};
          color: ${props.theme.colors.diffModifiedText};
        `;
      default:
        return `
          background-color: ${props.theme.colors.surface};
          color: ${props.theme.colors.text};
        `;
    }
  }}
`;

export const DiffLineNumber = styled.span`
  position: absolute;
  left: 0;
  width: 50px;
  padding: 2px 4px;
  text-align: right;
  color: ${(props) => props.theme.colors.textTertiary};
  
  @media (max-width: 768px) {
    width: 45px;
    font-size: 11px;
  }
  
  @media (max-width: 480px) {
    width: 40px;
    font-size: 10px;
  }
`;

export const DiffLineContent = styled.div`
  flex: 1;
  margin-left: 10px;
  
  @media (max-width: 768px) {
    margin-left: 8px;
  }
  
  @media (max-width: 480px) {
    margin-left: 6px;
  }
`;

export const WordHighlight = styled.span<{ $type: 'added' | 'removed' | 'modified' | 'unchanged' }>`
  ${(props) => {
    switch (props.$type) {
      case 'added':
        return `
          background-color: rgba(34, 197, 94, 0.15);
          color: #22c55e;
          padding: 1px 2px;
          border-radius: 2px;
        `;
      case 'removed':
        return `
          background-color: rgba(239, 68, 68, 0.15);
          color: #ef4444;
          padding: 1px 2px;
          border-radius: 2px;
        `;
      case 'modified':
        return `
          background-color: rgba(234, 179, 8, 0.15);
          color: #eab308;
          padding: 1px 2px;
          border-radius: 2px;
        `;
      default:
        return `
          color: inherit;
        `;
    }
  }}
`;

export const DiffLinePrefix = styled.span`
  position: absolute;
  left: 50px;
  width: 10px;
  font-weight: 600;
  user-select: none;
  color: inherit;
  
  @media (max-width: 768px) {
    left: 45px;
    width: 8px;
  }
  
  @media (max-width: 480px) {
    left: 40px;
    width: 6px;
  }
`;


export const Statistics = styled.div`
  padding: 8px 16px;
  background-color: ${(props) => props.theme.colors.surfaceHover};
  border-top: 1px solid ${(props) => props.theme.colors.border};
  font-size: 12px;
  color: ${(props) => props.theme.colors.textSecondary};
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    padding: 6px 12px;
    gap: 12px;
    font-size: 11px;
  }
  
  @media (max-width: 480px) {
    padding: 6px 10px;
    gap: 8px;
    font-size: 10px;
  }
`;

export const StatItemOld = styled.span`
  display: flex;
  align-items: center;
  gap: 4px;
`;

export const SummaryBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  background-color: ${(props) => props.theme.colors.surfaceHover};
  border-bottom: 1px solid ${(props) => props.theme.colors.border};
  gap: 16px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
`;

export const SummaryTitle = styled.h3`
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: ${(props) => props.theme.colors.text};
  white-space: nowrap;
  
  @media (max-width: 768px) {
    font-size: 14px;
  }
  
  @media (max-width: 480px) {
    font-size: 13px;
  }
`;

export const SummaryStats = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    width: 100%;
    justify-content: space-between;
  }
`;

export const DifferencesBadge = styled.span`
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  background-color: #fef3c7;
  color: #92400e;
  
  @media (max-width: 768px) {
    padding: 3px 10px;
    font-size: 11px;
  }
  
  @media (max-width: 480px) {
    padding: 2px 8px;
    font-size: 10px;
  }
`;

export const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
  
  @media (max-width: 480px) {
    gap: 6px;
  }
`;

export const StatLabel = styled.span`
  font-size: 13px;
  font-weight: 500;
  color: ${(props) => props.theme.colors.text};
  
  @media (max-width: 768px) {
    font-size: 12px;
  }
  
  @media (max-width: 480px) {
    font-size: 11px;
  }
`;

interface StatValueProps {
  $type: 'added' | 'removed' | 'changed';
}

export const StatValue = styled.span<StatValueProps>`
  font-size: 13px;
  font-weight: 700;
  color: ${props => {
    if (props.$type === 'added') {
      return '#10b981'; // Green
    }
    if (props.$type === 'removed') {
      return '#ef4444'; // Red
    }
    if (props.$type === 'changed') {
      return '#f59e0b'; // Orange/Amber
    }
    return props.theme.colors.text;
  }};
  
  @media (max-width: 768px) {
    font-size: 12px;
  }
  
  @media (max-width: 480px) {
    font-size: 11px;
  }
`;

export const SummaryBarOld = styled.div`
  padding: 12px 24px;
  background-color: ${(props) => props.theme.colors.surface};
  border-bottom: 1px solid ${(props) => props.theme.colors.border};
  font-size: 14px;
  color: ${(props) => props.theme.colors.text};
  display: flex;
  gap: 16px;
  align-items: center;
  font-weight: 500;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    padding: 10px 16px;
    font-size: 12px;
    gap: 12px;
  }
  
  @media (max-width: 480px) {
    padding: 8px 12px;
    font-size: 11px;
    gap: 8px;
    flex-direction: column;
    align-items: flex-start;
  }
`;

export const StatusText = styled.span<{ type: 'error' | 'success' }>`
  color: ${(props) =>
    props.type === 'error'
      ? props.theme.colors.error
      : props.theme.colors.diffAddedText};
`;

export const ClearIcon = styled.span`
  font-size: 16px;
  line-height: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-right: 6px;
`;
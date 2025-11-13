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
`;

export const ToggleLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: ${(props) => props.theme.colors.text};
  cursor: pointer;
  user-select: none;
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
`;

export const OptionsHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
`;

export const OptionsTitle = styled.h3`
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: ${(props) => props.theme.colors.text};
`;

export const OptionsContent = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
`;

export const CommonButtons = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const ActionButtons = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-right: 16px;
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
    color: ${(props) => props.theme.colors.white};
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
`;

export const HiddenFileInput = styled.input`
  display: none;
`;

export const InputSection = styled.div`
  display: flex;
  gap: 16px;
  padding: 24px;
  background-color: ${(props) => props.theme.colors.background};
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
  overflow: hidden;
  min-height: 350px;
  height: 350px;
  display: flex;
  
  @media (max-width: 768px) {
    min-height: 600px;
    height: 600px;
  }
  
  @media (max-width: 480px) {
    min-height: 500px;
    height: 500px;
  }
`;

export const TextArea = styled.textarea`
  flex: 1;
  width: 100%;
  height: 100%;
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
`;

export const ErrorMessage = styled.div`
  padding: 8px 12px;
  background-color: ${(props) => props.theme.colors.diffRemovedBg};
  border: 1px solid ${(props) => props.theme.colors.diffRemovedText};
  color: ${(props) => props.theme.colors.diffRemovedText};
  font-size: 12px;
  margin-top: 8px;
  border-radius: ${(props) => props.theme.radii.sm};
`;

export const SuccessMessage = styled.div`
  padding: 8px 12px;
  background-color: ${(props) => props.theme.colors.diffAddedBg};
  border: 1px solid ${(props) => props.theme.colors.diffAddedText};
  color: ${(props) => props.theme.colors.diffAddedText};
  font-size: 12px;
  margin-top: 8px;
  border-radius: ${(props) => props.theme.radii.sm};
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
`;

export const ComparisonSection = styled.div`
  flex: 1;
  display: flex;
  gap: 16px;
  padding: 24px;
  background-color: ${(props) => props.theme.colors.background};
  overflow: hidden;
`;

export const DiffPanel = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 400px;
  height: 400px;
  background-color: ${(props) => props.theme.colors.surface};
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: ${(props) => props.theme.radii.md};
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

export const DiffHeader = styled.div`
  padding: 12px 16px;
  background-color: ${(props) => props.theme.colors.surfaceHover};
  border-bottom: 1px solid ${(props) => props.theme.colors.border};
  font-size: 14px;
  font-weight: 600;
  color: ${(props) => props.theme.colors.text};
  text-transform: uppercase;
`;

export const DiffContent = styled.div`
  flex: 1;
  overflow-y: auto;
  overflow-x: auto;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
  font-size: 13px;
  line-height: 1.6;
  min-height: 0;

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
`;

export const DiffLineContent = styled.div`
  flex: 1;
  margin-left: 10px;
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
`;

export const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
`;

export const StatLabel = styled.span`
  font-size: 13px;
  font-weight: 500;
  color: ${(props) => props.theme.colors.text};
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
`;

export const StatusText = styled.span<{ type: 'error' | 'success' }>`
  color: ${(props) =>
    props.type === 'error'
      ? props.theme.colors.error
      : props.theme.colors.diffAddedText};
`;

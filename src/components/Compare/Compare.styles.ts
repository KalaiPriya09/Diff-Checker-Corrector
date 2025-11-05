import styled from 'styled-components';

export const Container = styled.div`
  padding: 32px;
  max-width: 1400px;
  margin: 0 auto;
`;

export const ContentCard = styled.div`
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06);
  padding: 24px;
`;

export const TopBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
  
  @media (max-width: 768px) {
    margin-bottom: 16px;
    gap: 12px;
  }
  
  @media (max-width: 480px) {
    margin-bottom: 12px;
    gap: 8px;
  }
`;

export const OptionsWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
`;

export const ModeSelect = styled.select`
  padding: 10px 16px;
  border: 1px solid ${props => props.theme.colors.inputBorder};
  border-radius: 8px;
  background-color: ${props => props.theme.colors.inputBackground};
  color: ${props => props.theme.colors.text};
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  outline: none;
  transition: all 0.2s;
  
  &:hover {
    border-color: ${props => props.theme.colors.primary};
  }
  
  &:focus {
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.purpleLight};
  }
  
  @media (max-width: 768px) {
    padding: 8px 12px;
    font-size: 13px;
  }
  
  @media (max-width: 480px) {
    padding: 6px 10px;
    font-size: 12px;
  }
`;

export const CompareButton = styled.button`
  background: #79589b;
  color: #ffffff;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
  white-space: nowrap;
  
  &:hover {
    background: #6a4d87;
    transform: translateY(-1px);
    box-shadow: 0 4px 6px rgba(121, 88, 155, 0.3);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  @media (max-width: 768px) {
    padding: 10px 20px;
    font-size: 13px;
  }
  
  @media (max-width: 480px) {
    padding: 8px 16px;
    font-size: 12px;
    gap: 6px;
  }
`;

export const InputsContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 24px;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
  
  @media (max-width: 768px) {
    gap: 16px;
    margin-bottom: 16px;
  }
  
  @media (max-width: 480px) {
    gap: 12px;
    margin-bottom: 12px;
  }
`;

export const InputSection = styled.div`
  display: flex;
  flex-direction: column;
  max-height: 600px;
  overflow: hidden;
  
  @media (max-width: 768px) {
    max-height: 500px;
  }
  
  @media (max-width: 480px) {
    max-height: 400px;
  }
`;

export const InputLabel = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 600;
  color:${props => props.theme.colors.text};
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  @media (max-width: 480px) {
    font-size: 12px;
    margin-bottom: 6px;
  }
`;

export const ContentSize = styled.div`
  margin-top: 8px;
  font-size: 12px;
  color: #9ca3af;
  font-weight: 400;
`;

export const TextArea = styled.textarea`
  width: 100%;
  min-height: 300px;
  padding: 16px;
  border: 1px solid ${props => props.theme.colors.inputBorder};
  border-radius: 8px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 14px;
  resize: vertical;
  line-height: 1.6;
  background-color: ${props => props.theme.colors.inputBackground};
  color: ${props => props.theme.colors.text};
  transition: background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.purpleLight};
  }
  
  &::placeholder {
    color: ${props => props.theme.colors.textTertiary};
  }
  
  @media (max-width: 768px) {
    min-height: 250px;
    padding: 12px;
    font-size: 13px;
  }
  
  @media (max-width: 480px) {
    min-height: 200px;
    padding: 10px;
    font-size: 12px;
  }
`;

export const ResultSection = styled.div`
  margin-top: 24px;
  max-height: 600px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  
  @media (max-width: 768px) {
    max-height: 500px;
  }
  
  @media (max-width: 480px) {
    max-height: 400px;
  }
`;

export const ResultHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 16px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
`;

export const ResultHeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
`;

export const ResultHeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
`;

export const ResultTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  margin: 0;
  transition: color 0.3s ease;
`;

export const ChangeBadge = styled.span`
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  background-color: #fef3c7;
  color: #92400e;
`;

export const ValidBadge = styled.span`
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  background-color: #d1fae5;
  color: #065f46;
  border: 1px solid #86efac;
  
  /* Style ✓ symbol inside */
  & > span:first-child {
    color: #065f46;
  }
`;

// Helper for checkmark symbol in badges
export const CheckmarkSymbol = styled.span`
  color: #065f46 !important;
  display: inline-block;
`;

// Helper for cross symbol in badges
export const CrossSymbol = styled.span`
  color: #991b1b !important;
  display: inline-block;
`;

export const DiffSummary = styled.div`
  display: flex;
  gap: 24px;
  align-items: center;
  
  @media (max-width: 768px) {
    gap: 16px;
  }
  
  @media (max-width: 480px) {
    gap: 12px;
  }
`;

export const DiffSummaryItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const DiffSummaryLabel = styled.span`
  font-size: 12px;
  font-weight: 500;
  color: ${props => props.theme.colors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: color 0.3s ease;
`;

export const DiffSummaryValue = styled.span<{ type: 'added' | 'removed' | 'modified' }>`
  font-size: 14px;
  font-weight: 700;
  transition: color 0.3s ease;
  color: ${props => {
    if (props.type === 'added') {
      return '#10b981'; // Green
    }
    if (props.type === 'removed') {
      return '#ef4444'; // Red
    }
    if (props.type === 'modified') {
      return '#f59e0b'; // Orange/Amber
    }
    return props.theme.colors.text;
  }};
`;

export const SuccessMessage = styled.div`
  padding: 16px 20px;
  background-color: #d1fae5;
  border: 1px solid #86efac;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
  color: #065f46;
`;

export const DifferencesGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-top: 16px;
  flex: 1;
  min-height: 0;
  overflow: hidden;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

export const DiffColumn = styled.div`
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  overflow: hidden;
  transition: border-color 0.3s ease;
  display: flex;
  flex-direction: column;
  min-height: 0;
  max-height: 100%;
`;

export const DiffHeader = styled.div`
  padding: 12px 16px;
  background-color: ${props => props.theme.colors.surface};
  border-bottom: 1px solid ${props => props.theme.colors.border};
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  transition: background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease;
`;

export const DiffContent = styled.div`
  max-height: 500px;
  overflow-y: auto;
  overflow-x: auto;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
  line-height: 1.8;
  background-color: ${props => props.theme.colors.cardBackground};
  transition: background-color 0.3s ease;
  
  /* Ensure scrollbar is fully visible and styled - INSIDE the panel */
  scrollbar-width: thin;
  scrollbar-color: ${props => props.theme.colors.inputBorder} ${props => props.theme.colors.cardBackground};
  
  &::-webkit-scrollbar {
    width: 12px;
    height: 12px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${props => props.theme.colors.cardBackground};
    border-radius: 0 8px 8px 0;
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: ${props => props.theme.colors.inputBorder};
    border-radius: 6px;
    border: 2px solid ${props => props.theme.colors.cardBackground};
    background-clip: padding-box;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background-color: ${props => props.theme.colors.textTertiary};
  }
  
  &::-webkit-scrollbar-corner {
    background: ${props => props.theme.colors.cardBackground};
  }
  
  @media (max-width: 768px) {
    max-height: 400px;
  }
  
  @media (max-width: 480px) {
    max-height: 300px;
  }
`;

export const DiffLine = styled.div<{ type?: 'added' | 'removed' | 'modified'; $isBlank?: boolean }>`
  padding: 4px 16px;
  display: flex;
  gap: 8px;
  ${props => {
    // Remove gray background - only show colors for actual differences
    if (props.type === 'added') {
      return `
        background-color: ${props.theme.colors.diffAddedBg};
      `;
    }
    if (props.type === 'removed') {
      return `
        background-color: ${props.theme.colors.diffRemovedBg};
      `;
    }
    if (props.type === 'modified') {
      return `
        background-color: ${props.theme.colors.diffModifiedBg};
      `;
    }
    // No background for unchanged lines
    return '';
  }}
  transition: background-color 0.3s ease;
`;

export const LineNumber = styled.span`
  color: ${props => props.theme.colors.textTertiary};
  user-select: none;
  min-width: 40px;
  text-align: right;
  transition: color 0.3s ease;
`;

export const LineContent = styled.span<{ type?: 'added' | 'removed' | 'modified' }>`
  flex: 1;
  white-space: pre-wrap;
  word-break: break-word;
  transition: color 0.3s ease;
  color: ${props => {
    if (props.type === 'added') {
      return props.theme.colors.diffAddedText;
    }
    if (props.type === 'removed') {
      return props.theme.colors.diffRemovedText;
    }
    if (props.type === 'modified') {
      return props.theme.colors.diffModifiedText;
    }
    return props.theme.colors.text;
  }};
`;

export const WordHighlight = styled.span<{ type: 'added' | 'removed' | 'modified' | 'unchanged' }>`
  padding: 2px 4px;
  border-radius: 3px;
  transition: all 0.2s ease;
  ${props => {
    if (props.type === 'added') {
      return `
        color: #22c55e;
        background-color: rgba(34, 197, 94, 0.15);
      `;
    }
    if (props.type === 'removed') {
      return `
        color: #ef4444;
        background-color: rgba(239, 68, 68, 0.15);
      `;
    }
    if (props.type === 'modified') {
      return `
        color: #eab308;
        background-color: rgba(234, 179, 8, 0.15);
      `;
    }
    // Unchanged - no highlighting
    return `
      color: inherit;
      background-color: transparent;
    `;
  }}
`;

export const DifferencesList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 16px 0 0 0;
`;

export const DifferenceItem = styled.li<{ type: 'added' | 'removed' | 'modified' | 'attribute_changed' }>`
  padding: 12px 16px;
  margin-bottom: 8px;
  border-radius: 8px;
  border-left: 4px solid;
  background-color: ${props => props.theme.colors.cardBackground};
  font-size: 14px;
  transition: background-color 0.3s ease, color 0.3s ease;
  
  border-color: ${props => {
    switch (props.type) {
      case 'added': return '#10b981';
      case 'removed': return '#ef4444';
      case 'modified': return '#f59e0b';
      case 'attribute_changed': return props.theme.colors.primary;
      default: return props.theme.colors.border;
    }
  }};
  
  color: ${props => props.theme.colors.text};
`;

export const DiffCode = styled.code`
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
  padding: 2px 6px;
  border-radius: 4px;
  background-color: ${props => props.theme.colors.surfaceHover};
  color: ${props => props.theme.colors.text};
  transition: background-color 0.3s ease, color 0.3s ease;
`;

export const StyledErrorBox = styled.div`
  background-color: #fee2e2;
  border: 1px solid #ef4444;
  color: #b91c1c;
  padding: 16px;
  border-radius: 8px;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  line-height: 1.5;

  .error-icon {
    font-size: 20px;
    line-height: 1;
    flex-shrink: 0;
    color: #991b1b;
  }

  .error-message-content {
    display: flex;
    flex-direction: column;
    gap: 4px;
    flex: 1;
  }

  .error-title {
    font-size: 16px;
    font-weight: 600;
    color: #b91c1c;
    margin: 0;
  }

  .error-detail {
    font-size: 14px;
    font-weight: 400;
    color: #b91c1c;
    margin: 0;
  }
`;
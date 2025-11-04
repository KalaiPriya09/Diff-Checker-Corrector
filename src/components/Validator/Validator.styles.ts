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

export const InputSection = styled.div`
  margin-bottom: 24px;
`;

export const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  flex-wrap: wrap;
  gap: 8px;
`;

export const ActionsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

export const LabelContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
`;

export const Label = styled.label`
  display: block;
  font-size: 16px;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  margin-bottom: 0;
  transition: color 0.3s ease;
`;

export const StatusBadge = styled.span<{ isValid?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  background-color: ${props => props.isValid ? '#d1fae5' : props.isValid === false ? '#fee2e2' : 'transparent'};
  color: ${props => props.isValid ? '#065f46' : props.isValid === false ? '#991b1b' : 'inherit'};
`;

export const TextArea = styled.textarea`
  width: 100%;
  min-height: 400px;
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
    min-height: 300px;
    padding: 12px;
    font-size: 13px;
  }
  
  @media (max-width: 480px) {
    min-height: 250px;
    padding: 10px;
    font-size: 12px;
  }
`;

export const ValidateButton = styled.button`
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

export const ResultSection = styled.div`
  margin-top: 24px;
  padding: 16px 20px;
  border-radius: 8px;
  background-color: #d1fae5;
  border: 1px solid #86efac;
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const ErrorResultSection = styled.div`
  margin-top: 24px;
  padding: 16px 20px;
  border-radius: 8px;
  background-color: #fee2e2;
  border: 1px solid #fca5a5;
  display: flex;
  align-items: flex-start;
  gap: 12px;
`;

export const ResultIcon = styled.span`
  font-size: 20px;
  flex-shrink: 0;
`;

export const ResultContent = styled.div`
  flex: 1;
`;

export const ResultTitle = styled.h3`
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
  color: #065f46;
`;

export const ErrorTitle = styled.h3`
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
  color: #991b1b;
`;

export const ResultMessage = styled.p`
  margin: 0;
  font-size: 14px;
  color: #047857;
`;

export const ErrorMessage = styled.p`
  margin: 0;
  font-size: 14px;
  color: #7f1d1d;
`;

export const ErrorDetails = styled.div`
  margin-top: 8px;
  padding: 12px;
  background-color: #ffffff;
  border-left: 3px solid #ef4444;
  border-radius: 4px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
  color: #6b7280;
`;
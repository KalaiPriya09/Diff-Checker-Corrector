import styled from 'styled-components';

export const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 16px;
  animation: fadeIn 0.2s ease-in-out;
  
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
  
  @media (max-width: 480px) {
    padding: 8px;
  }
`;

export const ModalContainer = styled.div`
  background: ${props => props.theme.colors.cardBackground};
  border-radius: ${props => props.theme.radii.lg};
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 500px;
  width: 100%;
  animation: slideUp 0.3s ease-out;
  
  @keyframes slideUp {
    from {
      transform: translateY(20px) scale(0.95);
      opacity: 0;
    }
    to {
      transform: translateY(0) scale(1);
      opacity: 1;
    }
  }
  
  @media (max-width: 480px) {
    max-width: 100%;
    border-radius: ${props => props.theme.radii.md};
  }
`;

export const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid ${props => props.theme.colors.border};
  
  @media (max-width: 480px) {
    padding: 16px 20px;
  }
`;

export const ModalTitle = styled.h3`
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: ${props => props.theme.colors.text};
  
  @media (max-width: 480px) {
    font-size: 18px;
  }
`;

export const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: ${props => props.theme.colors.textSecondary};
  cursor: pointer;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
  padding: 0;
  
  &:hover:not(:disabled) {
    background: ${props => props.theme.colors.surfaceHover};
    color: ${props => props.theme.colors.text};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  svg {
    width: 18px;
    height: 18px;
  }
`;

export const ModalBody = styled.div`
  padding: 24px;
  
  @media (max-width: 480px) {
    padding: 20px;
  }
`;

export const UrlInputContainer = styled.div`
  display: flex;
  gap: 8px;
  width: 100%;
  
  @media (max-width: 480px) {
    flex-direction: column;
    gap: 8px;
  }
`;

export const UrlInput = styled.input`
  flex: 1;
  padding: 12px 16px;
  border: 2px solid ${props => props.theme.colors.inputBorder};
  border-radius: ${props => props.theme.radii.md};
  font-size: 14px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
  background: ${props => props.theme.colors.inputBackground};
  color: ${props => props.theme.colors.text};
  transition: border-color 0.2s;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  &::placeholder {
    color: ${props => props.theme.colors.textTertiary};
  }
  
  @media (max-width: 480px) {
    padding: 10px 14px;
    font-size: 13px;
  }
`;

export const SampleUrlButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 12px 16px;
  background: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.text};
  border: 2px solid ${props => props.theme.colors.inputBorder};
  border-radius: ${props => props.theme.radii.md};
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  flex-shrink: 0;
  
  &:hover:not(:disabled) {
    background: ${props => props.theme.colors.surfaceHover};
    border-color: ${props => props.theme.colors.primary};
    color: ${props => props.theme.colors.primary};
  }
  
  &:active:not(:disabled) {
    transform: scale(0.98);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
  
  @media (max-width: 480px) {
    width: 100%;
    justify-content: center;
    padding: 10px 14px;
  }
`;

export const ErrorMessage = styled.div`
  margin-top: 12px;
  padding: 10px 12px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: ${props => props.theme.radii.sm};
  color: #ef4444;
  font-size: 13px;
  line-height: 1.4;
`;

export const ModalFooter = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 20px;
  justify-content: flex-end;
  
  @media (max-width: 480px) {
    flex-direction: column-reverse;
    gap: 8px;
  }
`;

export const LoadButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: ${props => props.theme.colors.primary};
  color: ${props => props.theme.colors.white};
  border: none;
  border-radius: ${props => props.theme.radii.md};
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover:not(:disabled) {
    background: ${props => props.theme.colors.purpleDark};
    transform: translateY(-1px);
    box-shadow: 0 4px 6px rgba(121, 88, 155, 0.3);
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
  
  @media (max-width: 480px) {
    width: 100%;
    justify-content: center;
    padding: 12px 20px;
  }
`;

export const CancelButton = styled.button`
  padding: 10px 20px;
  background: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.text};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.radii.md};
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover:not(:disabled) {
    background: ${props => props.theme.colors.surfaceHover};
    border-color: ${props => props.theme.colors.inputBorder};
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  @media (max-width: 480px) {
    width: 100%;
    padding: 12px 20px;
  }
`;

export const LoadingSpinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: ${props => props.theme.colors.white};
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
  
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;


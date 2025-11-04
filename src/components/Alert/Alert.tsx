import React from 'react';
import {
  AlertOverlay,
  AlertContainer,
  AlertIcon,
  AlertContent,
  AlertTitle,
  AlertMessage,
  CloseButton,
} from './Alert.styles';

export interface AlertProps {
  title: string;
  message: string;
  onClose: () => void;
  show: boolean;
}

export const Alert: React.FC<AlertProps> = ({ title, message, onClose, show }) => {
  if (!show) return null;

  return (
    <AlertOverlay onClick={onClose}>
      <AlertContainer onClick={(e) => e.stopPropagation()}>
        <CloseButton onClick={onClose}>×</CloseButton>
        <AlertIcon>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" fill="white" />
            <path
              d="M8 8L16 16M16 8L8 16"
              stroke="#EF4444"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </AlertIcon>
        <AlertContent>
          <AlertTitle>{title}</AlertTitle>
          <AlertMessage>{message}</AlertMessage>
        </AlertContent>
      </AlertContainer>
    </AlertOverlay>
  );
};


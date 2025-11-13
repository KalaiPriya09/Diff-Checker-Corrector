import styled from 'styled-components';

export const AlertOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
  animation: fadeIn 0.2s ease-in-out;
  
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

export const AlertContainer = styled.div`
  background: #79589b;
  border-radius: 16px;
  padding: 24px;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 16px;
  animation: slideUp 0.3s ease-out;
  
  @keyframes slideUp {
    from {
      transform: translateY(20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
  
  @media (max-width: 480px) {
    padding: 20px;
    max-width: 90%;
    gap: 12px;
  }
`;

export const AlertIcon = styled.div`
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  @media (max-width: 480px) {
    width: 40px;
    height: 40px;
    
    svg {
      width: 20px;
      height: 20px;
    }
  }
`;

export const AlertContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const AlertTitle = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #ffffff;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
  
  @media (max-width: 480px) {
    font-size: 16px;
  }
`;

export const AlertMessage = styled.p`
  margin: 0;
  font-size: 14px;
  color: #ffffff;
  line-height: 1.5;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
  
  @media (max-width: 480px) {
    font-size: 13px;
  }
`;

export const CloseButton = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  background: transparent;
  border: none;
  color: #ffffff;
  font-size: 24px;
  cursor: pointer;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s;
  padding: 0;
  line-height: 1;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.2);
  }
  
  &:active {
    background-color: rgba(255, 255, 255, 0.3);
  }
  
  @media (max-width: 480px) {
    top: 12px;
    right: 12px;
    width: 28px;
    height: 28px;
    font-size: 20px;
  }
`;


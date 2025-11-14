import styled from 'styled-components';

export const HeaderContainer = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  width: 100%;
  background: #79589b;
  padding: 24px 32px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  color: #ffffff;
  gap: 16px;
  z-index: 1000;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  
  @media (max-width: 1024px) {
    padding: 20px 24px;
  }
  
  @media (max-width: 768px) {
    flex-direction: column;
    padding: 16px 20px;
    align-items: flex-start;
    gap: 12px;
  }
  
  @media (max-width: 480px) {
    padding: 12px 16px;
    align-items: flex-start;
    gap: 10px;
  }
`;

export const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
  min-width: 0;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  @media (max-width: 480px) {
    gap: 6px;
  }
`;

export const LogoBadge = styled.div`
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 8px 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  backdrop-filter: blur(10px);
  
  @media (max-width: 768px) {
    padding: 6px 10px;
  }
  
  @media (max-width: 480px) {
    padding: 5px 8px;
    gap: 6px;
  }
`;

export const LogoIcon = styled.div`
  width: 24px;
  height: 24px;
  background-color: #ffffff;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: #79589b;
  font-size: 14px;
`;

export const LogoText = styled.span`
  font-weight: 700;
  font-size: 25px;
  color: #ffffff;
  
  @media (max-width: 768px) {
    font-size: 22px;
  }
  
  @media (max-width: 480px) {
    font-size: 18px;
  }
`;

export const TitleSection = styled.div`
  display: flex;
  flex-direction: column;
  
  @media (max-width: 768px) {
    width: 100%;
  }
`;

export const MainTitle = styled.h1`
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  color: #ffffff;
  line-height: 1.2;
  
  @media (max-width: 768px) {
    font-size: 22px;
  }
  
  @media (max-width: 480px) {
    font-size: 18px;
  }
`;

export const Subtitle = styled.p`
  margin: 4px 0 0 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 400;
  
  @media (max-width: 480px) {
    font-size: 12px;
  }
`;

export const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
  flex-wrap: wrap;
  
  @media (max-width: 1024px) {
    gap: 10px;
  }
  
  @media (max-width: 768px) {
    align-items: flex-start;
    padding-top: 0;
    gap: 8px;
    width: 100%;
    justify-content: flex-end;
  }
  
  @media (max-width: 480px) {
    gap: 6px;
    align-items: flex-end;
  }
`;

export const ClearButton = styled.button`
  background-color: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: #ffffff;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;
  white-space: nowrap;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.25);
    border-color: rgba(255, 255, 255, 0.4);
  }
  
  &:active {
    transform: scale(0.98);
  }
  
  @media (max-width: 768px) {
    padding: 8px 16px;
    font-size: 13px;
  }
  
  @media (max-width: 480px) {
    width: 36px;
    height: 36px;
    padding: 0;
    border-radius: 8px;
    
    span:last-child {
      display: none;
    }
  }
`;

export const ClearIcon = styled.span`
  font-size: 18px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  
`;


import styled from 'styled-components';

export const HeaderContainer = styled.header`
  position: fixed;
  /* top: 24px; - Removed as per request */
  left: 50%;
  transform: translateX(-50%);
  width: calc(100% - 48px);
  max-width: 1400px;
  background: ${({ theme }) => theme.colors.cardBackground};
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid ${({ theme }) => theme.colors.glassBorder};
  border-radius: ${({ theme }) => theme.radii.lg};
  padding: 16px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: ${({ theme }) => theme.colors.text};
  gap: 16px;
  z-index: 1000;
  box-shadow: ${({ theme }) => theme.shadows.floating};
  transition: all 0.3s ease;
  
  @media (max-width: 1024px) {
    /* top: 20px; */
    width: calc(100% - 40px);
    padding: 16px 20px;
  }
  
  @media (max-width: 768px) {
    /* top: 16px; */
    width: calc(100% - 32px);
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
    border-radius: ${({ theme }) => theme.radii.md};
  }
  
  @media (max-width: 480px) {
    /* top: 12px; */
    width: calc(100% - 24px);
    padding: 12px 16px;
  }
`;

export const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  flex: 1;
  min-width: 0;
  
  @media (max-width: 1024px) {
    gap: 16px;
  }
  
  @media (max-width: 768px) {
    width: 100%;
    justify-content: flex-start;
    gap: 12px;
  }
  
  @media (max-width: 480px) {
    gap: 10px;
  }
`;

export const LogoBadge = styled.div`
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.gradientStart}, ${({ theme }) => theme.colors.gradientEnd});
  border-radius: ${({ theme }) => theme.radii.md};
  padding: 8px 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 4px 12px ${({ theme }) => theme.colors.purpleMedium};
  transition: transform 0.2s ease;
  
  @media (max-width: 768px) {
    padding: 6px 10px;
    gap: 8px;
  }
  
  @media (max-width: 480px) {
    padding: 6px 8px;
    gap: 6px;
  }
  
  &:hover {
    transform: translateY(-2px);
  }
`;

export const LogoIcon = styled.div`
  width: 28px;
  height: 28px;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.primary};
  font-size: 16px;
  
  @media (max-width: 768px) {
    width: 24px;
    height: 24px;
    font-size: 14px;
  }
  
  @media (max-width: 480px) {
    width: 22px;
    height: 22px;
    font-size: 12px;
  }
`;

export const LogoText = styled.span`
  font-weight: 700;
  font-size: 20px;
  color: #ffffff;
  letter-spacing: -0.5px;
  
  @media (max-width: 768px) {
    font-size: 18px;
  }
  
  @media (max-width: 480px) {
    font-size: 16px;
  }
`;

export const TitleSection = styled.div`
  display: flex;
  flex-direction: column;
  
  @media (max-width: 768px) {
    flex: 1;
  }
`;

export const MainTitle = styled.h1`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  line-height: 1.2;
  
  @media (max-width: 1024px) {
    font-size: 16px;
  }
  
  @media (max-width: 768px) {
    font-size: 15px;
  }
  
  @media (max-width: 480px) {
    font-size: 14px;
  }
`;

export const Subtitle = styled.p`
  margin: 2px 0 0 0;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.subtleText};
  font-weight: 400;
  
  @media (max-width: 1024px) {
    font-size: 11px;
  }
  
  @media (max-width: 480px) {
    display: none;
  }
`;

export const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
  
  @media (max-width: 1024px) {
    gap: 10px;
  }
  
  @media (max-width: 768px) {
    width: 100%;
    justify-content: flex-start;
    padding-top: 12px;
    border-top: 1px solid ${({ theme }) => theme.colors.border};
    gap: 10px;
  }
  
  @media (max-width: 480px) {
    gap: 6px;
    justify-content: flex-end;
  }
`;

export const ClearButton = styled.button`
  background: transparent;
  border: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.text};
  padding: 8px 16px;
  border-radius: ${({ theme }) => theme.radii.md};
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s ease;
  
  @media (max-width: 768px) {
    padding: 6px 12px;
    font-size: 13px;
    gap: 6px;
  }
  
  @media (max-width: 480px) {
    padding: 8px;
    width: 36px;
    height: 36px;
    gap: 0;
    
    /* Hide only the text span, not the icon */
    > span:last-child {
      display: none;
    }
  }
  
  &:hover {
    background: ${({ theme }) => theme.colors.surfaceHover};
    border-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.primary};
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

export const ClearIcon = styled.span`
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: inherit;
  
  @media (max-width: 480px) {
    font-size: 18px;
    font-weight: 600;
  }
`;

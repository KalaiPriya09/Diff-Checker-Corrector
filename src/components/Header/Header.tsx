import React from 'react';
import { ThemeToggle } from '../ThemeToggle';
import { OtherTools } from '../OtherTools';
import type { ThemeMode, componentType } from '../../types/common';
import {
  HeaderContainer,
  HeaderLeft,
  LogoBadge,
  LogoIcon,
  LogoText,
  TitleSection,
  MainTitle,
  Subtitle,
  HeaderRight,
  ClearButton,
  ClearIcon,
} from './Header.styles';
import { EncryptedStorage } from '../../services/encryptedStorage';
import { clearAllSessionData } from '../../services/sessionStorage';

interface HeaderProps {
  themeMode?: ThemeMode;
  onThemeToggle?: () => void;
  activeView?: componentType;
  onFormatChange?: (format: componentType) => void;
  onClearAll?: () => void; // Callback to clear inputs in DiffChecker
}

export const Header: React.FC<HeaderProps> = ({ 
  themeMode = 'light', 
  onThemeToggle, 
  onFormatChange,
  onClearAll,
}) => {
  const handleClearAll = async () => {
    try {
      // Clear all session storage for all 5 formats (both encryptedStorage and sessionStorage)
      await EncryptedStorage.clearAllSessions();
      clearAllSessionData();
      
      // Clear inputs in the active DiffChecker component
      if (onClearAll) {
        onClearAll();
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error clearing all sessions:', error);
    }
  };

  return (
    <>
      <HeaderContainer>
        <HeaderLeft>
          <LogoBadge>
            <LogoIcon>IX</LogoIcon>
            <LogoText>IONIXX</LogoText>
          </LogoBadge>
          <TitleSection>
            <MainTitle>Diff Checker & Corrector</MainTitle>
            <Subtitle>Comparison and validation tool</Subtitle>
          </TitleSection>
        </HeaderLeft>
        <HeaderRight>
            <OtherTools onFormatChange={onFormatChange} />
          <ClearButton 
            onClick={handleClearAll}
            title="Clear all data from all formats (JSON, XML, Text compare and validate)"
            aria-label="Clear all data from all formats"
          >
            <ClearIcon>↻</ClearIcon>
            <span>Clear All</span>
          </ClearButton>
          {onThemeToggle && <ThemeToggle mode={themeMode} onToggle={onThemeToggle} />}
        </HeaderRight>
      </HeaderContainer>
    </>
  );
};

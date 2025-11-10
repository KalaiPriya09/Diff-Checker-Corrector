import React, { useCallback } from 'react';
import { ThemeToggle } from '../ThemeToggle';
import { Button } from '../button';
import { EncryptedStorage } from '../../services/encryptedStorage';
import type { ThemeMode, ComponentType } from '../../types/common';
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
  ClearIcon,
} from './Header.styles';

interface HeaderProps {
  onClearAll?: () => void;
  themeMode?: ThemeMode;
  onThemeToggle?: () => void;
  activeView?: string;
}

export const Header: React.FC<HeaderProps> = ({ onClearAll, themeMode = 'light', onThemeToggle, activeView }) => {
  const handleClearAll = useCallback(async () => {
    try {
      if (activeView) {
        await EncryptedStorage.clearSession(activeView as ComponentType);
      } else {
        await EncryptedStorage.clearAllSessions();
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to clear session:', error);
    }
    onClearAll?.();
  }, [onClearAll, activeView]);

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
          {onThemeToggle && <ThemeToggle mode={themeMode} onToggle={onThemeToggle} />}
          <Button onClick={handleClearAll} variant="secondary">
            <ClearIcon>↻</ClearIcon>
            <span>Clear All</span>
          </Button>
        </HeaderRight>
      </HeaderContainer>
    </>
  );
};

import React, { useCallback } from 'react';
import { ThemeToggle } from '../ThemeToggle';
import { Button } from '../button';
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
  ClearIcon,
} from './Header.styles';

interface HeaderProps {
  onClearAll?: () => void;
  themeMode?: ThemeMode;
  onThemeToggle?: () => void;
  activeView?: componentType;
  onFormatChange?: (format: componentType) => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  onClearAll, 
  themeMode = 'light', 
  onThemeToggle, 
  onFormatChange 
}) => {
  const handleClearAll = useCallback(() => {
    // It will clear both inputs and session storage for the current format
    onClearAll?.();
  }, [onClearAll]);

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

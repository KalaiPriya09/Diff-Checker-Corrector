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
} from './Header.styles';

interface HeaderProps {
  themeMode?: ThemeMode;
  onThemeToggle?: () => void;
  activeView?: componentType;
  onFormatChange?: (format: componentType) => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  themeMode = 'light', 
  onThemeToggle, 
  onFormatChange 
}) => {

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
        </HeaderRight>
      </HeaderContainer>
    </>
  );
};

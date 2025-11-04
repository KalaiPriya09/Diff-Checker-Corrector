import React from 'react';
import { ThemeToggle } from '../ThemeToggle';
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

interface HeaderProps {
  onClearAll?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onClearAll }) => {
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
          <ThemeToggle />
          <ClearButton onClick={onClearAll}>
            <ClearIcon>↻</ClearIcon>
            <span>Clear All</span>
          </ClearButton>
        </HeaderRight>
      </HeaderContainer>
    </>
  );
};

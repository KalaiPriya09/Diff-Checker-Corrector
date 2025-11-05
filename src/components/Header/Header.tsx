import React from 'react';
import { ThemeToggle } from '../ThemeToggle';
import { APP_NAME, APP_DESCRIPTION } from '../../constants';
import { Button } from '../button';
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
            <MainTitle>{APP_NAME}</MainTitle>
            <Subtitle>{APP_DESCRIPTION}</Subtitle>
          </TitleSection>
        </HeaderLeft>
        <HeaderRight>
          <ThemeToggle />
          <Button onClick={onClearAll} variant="secondary">
            <ClearIcon>↻</ClearIcon>
            <span>Clear All</span>
          </Button>
        </HeaderRight>
      </HeaderContainer>
    </>
  );
};

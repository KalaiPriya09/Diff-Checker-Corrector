import React from 'react';
import {
  SidebarContainer,
  LogoContainer,
  LogoTitle,
  NavList,
  NavItem,
  NavButton,
} from './Sidebar.styles';

export type ViewType =
  | 'json-validate'
  | 'xml-validate'
  | 'json-compare'
  | 'xml-compare'
  | 'text-compare';

interface SidebarProps {
  activeView: ViewType;
  onViewChange: (view: ViewType) => void;
}

const menuItems: Array<{ id: ViewType; label: string }> = [
  { id: 'json-validate', label: 'JSON Validate' },
  { id: 'xml-validate', label: 'XML Validate' },
  { id: 'json-compare', label: 'JSON Compare' },
  { id: 'xml-compare', label: 'XML Compare' },
  { id: 'text-compare', label: 'Text Compare' },
];

export const Sidebar: React.FC<SidebarProps> = ({ activeView, onViewChange }) => {
  return (
    <SidebarContainer>
      <LogoContainer>
        <LogoTitle>Diff Check & Correct</LogoTitle>
      </LogoContainer>
      <NavList>
        {menuItems.map(item => (
          <NavItem key={item.id}>
            <NavButton
              isActive={activeView === item.id}
              onClick={() => onViewChange(item.id)}
            >
              {item.label}
            </NavButton>
          </NavItem>
        ))}
      </NavList>
    </SidebarContainer>
  );
};

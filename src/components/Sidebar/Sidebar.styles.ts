import styled from 'styled-components';

export const SidebarContainer = styled.aside`
  width: 260px;
  background-color: #f9fafb;
  border-right: 1px solid #e5e7eb;
  height: 100vh;
  overflow-y: auto;
  padding: 24px 16px;
  position: fixed;
  left: 0;
  top: 0;
`;

export const LogoContainer = styled.div`
  padding: 0 12px 24px;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 24px;
`;

export const LogoTitle = styled.h1`
  font-size: 20px;
  font-weight: 700;
  color: #111827;
  margin: 0;
  line-height: 1.4;
`;

export const NavList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

export const NavItem = styled.li<{ isActive?: boolean }>`
  margin-bottom: 8px;
`;

export const NavButton = styled.button<{ isActive?: boolean }>`
  width: 100%;
  padding: 12px 16px;
  border: none;
  background-color: ${props => props.isActive ? '#79589b' : 'transparent'};
  color: ${props => props.isActive ? '#ffffff' : '#374151'};
  border-radius: 8px;
  font-size: 14px;
  font-weight: ${props => props.isActive ? '600' : '400'};
  text-align: left;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: ${props => props.isActive ? '#6a4d87' : '#f3f4f6'};
    color: ${props => props.isActive ? '#ffffff' : '#111827'};
  }
  
  &:focus {
    outline: 2px solid #79589b;
    outline-offset: 2px;
  }
`;

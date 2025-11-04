import React from 'react';
import { AppLayoutContainer, AppLayoutHeader } from './AppLayout.styles';
import { useAppLayout } from './useAppLayout';

export type AppLayoutProps = {
  children: React.ReactNode;
};

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { appTitle } = useAppLayout();
  return (
    <AppLayoutContainer>
      <AppLayoutHeader>
        <strong>{appTitle}</strong>
      </AppLayoutHeader>
      <section>{children}</section>
    </AppLayoutContainer>
  );
};


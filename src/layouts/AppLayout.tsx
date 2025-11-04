import React from 'react';

type AppLayoutProps = {
  children: React.ReactNode;
};

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <div style={{ padding: 24 }}>
      <header style={{ marginBottom: 24 }}>
        <strong>App Layout</strong>
      </header>
      <section>{children}</section>
    </div>
  );
};


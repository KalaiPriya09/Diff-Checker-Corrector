import React from 'react';
import { ThemeProvider } from 'styled-components';
import DiffChecker from '../components/diff-checker';
import { lightTheme } from '../theme';

const DiffCheckerPage: React.FC = () => {
  return (
    <ThemeProvider theme={lightTheme}>
      <DiffChecker />
    </ThemeProvider>
  );
};

export default DiffCheckerPage;


import Head from 'next/head';
import React, { useState, useCallback, useEffect } from 'react';
import { ThemeProvider } from 'styled-components';
import styled from 'styled-components';
import { Header } from '../components/Header';
import { Tabs } from '../components/Tabs';
import { JSONValidator, XMLValidator } from '../components/Validator';
import { JSONCompare, XMLCompare, TextCompare } from '../components/Compare';
import { lightTheme, darkTheme } from '../theme';
import type { ThemeMode, ViewType } from '../types/common';

const MainContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: ${props => props.theme.colors.background};
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  padding-top: 120px;
  
  @media (max-width: 768px) {
    padding-top: 110px;
  }
  
  @media (max-width: 480px) {
    padding-top: 100px;
  }
`;

const ContentWrapper = styled.div`
  flex: 1;
  padding: 24px 32px;
  background-color: ${props => props.theme.colors.background};
  transition: background-color 0.3s ease;
  
  @media (max-width: 768px) {
    padding: 16px 20px;
  }
  
  @media (max-width: 480px) {
    padding: 12px 16px;
  }
`;

const ContentCard = styled.div`
  background-color: ${props => props.theme.colors.cardBackground};
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06);
  padding: 24px;
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
  
  @media (max-width: 768px) {
    padding: 16px;
    border-radius: 8px;
  }
  
  @media (max-width: 480px) {
    padding: 12px;
    border-radius: 8px;
  }
`;

export default function Home() {
  const [themeMode, setThemeMode] = useState<ThemeMode>('light');
  const [currentTheme, setCurrentTheme] = useState<typeof lightTheme | typeof darkTheme>(lightTheme);
  const [activeView, setActiveView] = useState<ViewType>('json-validate');
  const [clearKey, setClearKey] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const storedTheme = localStorage.getItem('app-theme-mode') as ThemeMode | null;
    
    if (storedTheme && (storedTheme === 'light' || storedTheme === 'dark')) {
      setThemeMode(storedTheme);
      setCurrentTheme(storedTheme === 'dark' ? darkTheme : lightTheme);
    }
  }, []);

  const toggleTheme = () => {
    const newMode: ThemeMode = themeMode === 'light' ? 'dark' : 'light';
    setThemeMode(newMode);
    setCurrentTheme(newMode === 'dark' ? darkTheme : lightTheme);
    localStorage.setItem('app-theme-mode', newMode);
  };

  const handleClearAll = useCallback(() => {
    setClearKey(prev => prev + 1);
  }, []);

  const renderView = () => {
    switch (activeView) {
      case 'json-validate':
        return <JSONValidator key={`json-validate-${clearKey}`} />;
      case 'xml-validate':
        return <XMLValidator key={`xml-validate-${clearKey}`} />;
      case 'json-compare':
        return <JSONCompare key={`json-compare-${clearKey}`} />;
      case 'xml-compare':
        return <XMLCompare key={`xml-compare-${clearKey}`} />;
      case 'text-compare':
        return <TextCompare key={`text-compare-${clearKey}`} />;
      default:
        return <JSONValidator key={`default-${clearKey}`} />;
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Diff Checker & Corrector - Comparison and validation tool</title>
        <meta name="description" content="Compare and validate JSON, XML, and plain text files with visual diff highlighting. Supports drag & drop, file upload, and clipboard paste." />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="theme-color" content={themeMode === 'light' ? '#79589b' : '#6a4d87'} />
        <meta property="og:title" content="Diff Checker & Corrector" />
        <meta property="og:description" content="Compare and validate JSON, XML, and plain text with visual diff highlighting" />
        <meta property="og:type" content="website" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <ThemeProvider theme={currentTheme}>
        <MainContainer>
          <Header 
            onClearAll={handleClearAll} 
            themeMode={themeMode} 
            onThemeToggle={toggleTheme}
            activeView={activeView}
          />
          <ContentWrapper>
            <ContentCard>
              <Tabs activeView={activeView} onViewChange={setActiveView} />
              {renderView()}
            </ContentCard>
          </ContentWrapper>
        </MainContainer>
      </ThemeProvider>

      <style jsx global>{`
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        html {
          scroll-behavior: smooth;
        }
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
            'Ubuntu', 'Cantarell', sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          font-feature-settings: 'cv02', 'cv03', 'cv04', 'cv11';
          transition: background-color 0.4s cubic-bezier(0.4, 0, 0.2, 1), color 0.3s ease;
        }
        ::-webkit-scrollbar {
          width: 14px;
          height: 14px;
        }
        ::-webkit-scrollbar-track {
          background: ${themeMode === 'light' ? '#f1f5f9' : '#1e293b'};
          border-radius: 10px;
          border: 3px solid transparent;
          background-clip: content-box;
        }
        ::-webkit-scrollbar-thumb {
          background: ${themeMode === 'light' 
            ? 'linear-gradient(135deg, #79589b 0%, #6a4d87 100%)' 
            : 'linear-gradient(135deg, #79589b 0%, #6a4d87 100%)'};
          border-radius: 10px;
          border: 3px solid transparent;
          background-clip: content-box;
          transition: all 0.3s ease;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: ${themeMode === 'light'
            ? 'linear-gradient(135deg, #6a4d87 0%, #5a3d77 100%)'
            : 'linear-gradient(135deg, #8b68ab 0%, #7a5d97 100%)'};
        }
        *:focus-visible {
          outline: 3px solid ${themeMode === 'light' ? '#79589b' : '#8b68ab'};
          outline-offset: 2px;
          border-radius: 4px;
        }
        ::selection {
          background: ${themeMode === 'light' ? '#79589b' : '#8b68ab'};
          color: #ffffff;
        }
        * {
          transition-property: background-color, color, border-color, box-shadow;
          transition-duration: 0.3s;
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        }
        /* Disable animations for reduced motion preference */
        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
            scroll-behavior: auto !important;
          }
        }
        /* Print styles */
        @media print {
          body {
            background: white;
            color: black;
          }
        }
        /* Responsive typography */
        @media (max-width: 768px) {
          html {
            font-size: 14px;
          }
        }
        @media (min-width: 769px) and (max-width: 1024px) {
          html {
            font-size: 15px;
          }
        }
        @media (min-width: 1025px) {
          html {
            font-size: 16px;
          }
        }
      `}</style>
    </>
  );
}


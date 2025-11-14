/**
 * Modern Diff Checker & Validator - Main Application Page
 *
 * Integrates diff-checker and validator functionality
 *
 * Key Features:
 * - Fully responsive design (mobile, tablet, desktop)
 * - Theme switching with smooth transitions
 * - Modern UI with animations and hover effects
 * - Accessible (keyboard navigation, ARIA labels)
 */
import React, { useState, useEffect,useCallback } from 'react';
import Head from 'next/head';
import { ThemeProvider } from 'styled-components';
import styled from 'styled-components';
import DiffChecker from '../components/diff-checker';
import { lightTheme, darkTheme } from '../theme';
import type { ThemeMode, componentType } from '../types/common';
import { Header } from '../components/Header';

// Modern styled components with enhanced visual design
const PageContainer = styled.div`
  min-height: 100vh; /* Minimum height, but allow growth */
  overflow-y: auto; /* Allow scrolling when content exceeds viewport */
  overflow-x: hidden;
  background: ${(props) =>
    `linear-gradient(135deg, ${props.theme.colors.background} 0%, ${props.theme.colors.cardBackground} 100%)`};
  font-family: ${(props) => props.theme.fonts.body};
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
`;


const ContentContainer = styled.div`
  flex: 1;
  padding: 24px 32px;
  padding-top: calc(100px + 24px); /* Account for fixed header height (~100px) + top padding */
  margin: 0 24px; /* Reduced horizontal margins */
  width: calc(100% - 48px); /* Account for left and right margins */
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: ${(props) => props.theme.radii.md};
  background-color: ${(props) => props.theme.colors.surface};

  @media (max-width: 1024px) {
    padding: 20px 24px;
    padding-top: calc(140px + 20px); /* Header height on tablet when stacked */
    margin: 0 20px;
    width: calc(100% - 40px);
  }

  @media (max-width: 768px) {
    padding: 16px 20px;
    padding-top: calc(160px + 16px); /* Header height on tablet (stacked layout) */
    margin: 0 16px;
    width: calc(100% - 32px);
    border-radius: 8px;
  }

  @media (max-width: 480px) {
    padding: 12px 16px;
    padding-top: calc(180px + 12px); /* Header height on mobile (stacked layout) */
    margin: 0 12px;
    width: calc(100% - 24px);
    border-radius: 8px;
  }
`;

/**
 * Main application page component
 * Integrates theme management and diff checker functionality
 */
export default function Home() {
  // Theme state management
  const [themeMode, setThemeMode] = useState<ThemeMode>('light');
  const [currentTheme, setCurrentTheme] = useState<typeof lightTheme | typeof darkTheme>(lightTheme);
  const [activeView, setActiveView] = useState<componentType>('json-compare');
  const [clearKey, setClearKey] = useState(0);
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    
    // Load theme from localStorage
    const storedTheme = localStorage.getItem('app-theme-mode') as ThemeMode | null;
    if (storedTheme && (storedTheme === 'light' || storedTheme === 'dark')) {
      setThemeMode(storedTheme);
      setCurrentTheme(storedTheme === 'dark' ? darkTheme : lightTheme);
    }
    
    // Load active format from localStorage
    const storedFormat = localStorage.getItem('diff-checker-active-format') as componentType | null;
    const validFormats: componentType[] = ['json-compare', 'xml-compare', 'text-compare', 'json-validate', 'xml-validate'];
    if (storedFormat && validFormats.includes(storedFormat)) {
      setActiveView(storedFormat);
    }
  }, []);

  const toggleTheme = () => {
    const newMode: ThemeMode = themeMode === 'light' ? 'dark' : 'light';
    setThemeMode(newMode);
    setCurrentTheme(newMode === 'dark' ? darkTheme : lightTheme);
    localStorage.setItem('app-theme-mode', newMode);
  };

  const handleClearAll = useCallback(() => {
    // Increment clearKey to trigger clear in DiffChecker
    setClearKey(prev => prev + 1);
  }, []);

  const handleClearComplete = useCallback(() => {
    // Clear operation completed
    // This callback can be used for any post-clear actions if needed
  }, []);

  const handleFormatChange = useCallback((format: componentType) => {
    setActiveView(format);
    // Persist format to localStorage
    localStorage.setItem('diff-checker-active-format', format);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <>
      {/* Head section with metadata */}
      <Head>
        <title>Diff Checker & Corrector - Comparison and validation tool</title>
        <meta
          name="description"
          content="Compare and validate JSON, XML, and plain text files with visual diff highlighting. Supports drag & drop, file upload, and clipboard paste."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="theme-color" content={themeMode === 'light' ? '#79589b' : '#6a4d87'} />
        <meta property="og:title" content="Diff Checker & Corrector" />
        <meta
          property="og:description"
          content="Compare and validate JSON, XML, and plain text with visual diff highlighting"
        />
        <meta property="og:type" content="website" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Theme provider wraps the entire application */}
      <ThemeProvider theme={currentTheme}>
        <PageContainer>
          {/* Global Header with Theme Toggle */}
          
          <Header 
            themeMode={themeMode} 
            onThemeToggle={toggleTheme}
            activeView={activeView}
            onFormatChange={handleFormatChange}
          />

          {/* Content Container */}
          <ContentContainer>
            <DiffChecker 
              activeFormat={activeView} 
              clearKey={clearKey}
              onClearRequested={handleClearComplete}
            />
          </ContentContainer>
        </PageContainer>
      </ThemeProvider>

      {/* Modern Global Styles with enhanced visual design */}
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

        /* Modern custom scrollbar with gradient */
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
            : 'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)'};
          border-radius: 10px;
          border: 3px solid transparent;
          background-clip: content-box;
          transition: all 0.3s ease;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: ${themeMode === 'light'
            ? 'linear-gradient(135deg, #6a4d87 0%, #5a3d77 100%)'
            : 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'};
        }

        /* Enhanced focus visible for better accessibility */
        *:focus-visible {
          outline: 3px solid ${themeMode === 'light' ? '#79589b' : '#a78bfa'};
          outline-offset: 2px;
          border-radius: 4px;
        }

        /* Modern selection color with gradient */
        ::selection {
          background: ${themeMode === 'light' ? '#79589b' : '#a78bfa'};
          color: #ffffff;
        }

        /* Smooth animations for theme transitions */
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

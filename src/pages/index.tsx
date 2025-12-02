/**
 * Modern Diff Checker & Corrector - Main Application Page
 *
 * Integrates diff checker and validator functionality
 *
 * Key Features:
 * - Fully responsive design (mobile, tablet, desktop)
 * - Theme switching with smooth transitions
 * - Modern UI with animations and hover effects
 * - Accessible (keyboard navigation, ARIA labels)
 */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Head from 'next/head';
import { ThemeProvider } from 'styled-components';
import styled from 'styled-components';
import DiffChecker from '../components/diff-checker';
import { lightTheme, darkTheme } from '../theme';
import type { ThemeMode, componentType } from '../types/common';
import { Header } from '../components/Header';
import { loadActiveTab, saveActiveTab } from '../services/appStorage';

// Modern styled components with enhanced visual design
const PageContainer = styled.div`
  min-height: 100vh; /* Minimum height, but allow growth */
  overflow-y: auto; /* Allow scrolling when content exceeds viewport */
  overflow-x: hidden;
  background: ${(props) =>
    `linear-gradient(135deg, ${props.theme.colors.background} 0%, ${props.theme.colors.cardBackground} 100%)`};
  font-family: ${(props) => props.theme.fonts.body};
  /* Instant theme switching - no transition on theme-dependent properties */
  transition: transform 0.2s ease, opacity 0.2s ease !important;
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
  /* Instant theme switching - no transition on theme-dependent properties */
  transition: transform 0.2s ease, opacity 0.2s ease !important;

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
  const [activeView, setActiveView] = useState<componentType | null>(null);
  const [mounted, setMounted] = useState(false);
  const clearAllRef = useRef<(() => void) | null>(null);
  
  /**
   * Load saved theme preference and active tab from localStorage on component mount
   * Runs only on client side to avoid hydration mismatch
   */
  useEffect(() => {
    // Load theme from localStorage
    const storedTheme = localStorage.getItem('app-theme-mode') as ThemeMode | null;
    if (storedTheme && (storedTheme === 'light' || storedTheme === 'dark')) {
      setThemeMode(storedTheme);
      setCurrentTheme(storedTheme === 'dark' ? darkTheme : lightTheme);
    }
    
    // Load active tab from appStorage service (with migration from old key)
    let storedTab = loadActiveTab();
    const validFormats: componentType[] = ['json-compare', 'xml-compare', 'text-compare', 'json-validate', 'xml-validate'];
    
    // Migrate from old key if new key doesn't exist
    if (!storedTab) {
      const oldKey = localStorage.getItem('diff-checker-active-format');
      if (oldKey && validFormats.includes(oldKey as componentType)) {
        storedTab = oldKey;
        // Migrate to new key
        saveActiveTab(oldKey);
        // Remove old key
        localStorage.removeItem('diff-checker-active-format');
      }
    }
    
    if (storedTab && validFormats.includes(storedTab as componentType)) {
      setActiveView(storedTab as componentType);
    } else {
      // Default to json-compare if no saved tab
      setActiveView('json-compare');
    }
    
    // Mark as mounted after loading all client-side state
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const newMode: ThemeMode = themeMode === 'light' ? 'dark' : 'light';
    setThemeMode(newMode);
    setCurrentTheme(newMode === 'dark' ? darkTheme : lightTheme);
    localStorage.setItem('app-theme-mode', newMode);
  };


  const handleFormatChange = useCallback((format: componentType) => {
    setActiveView(format);
    // Persist format to appStorage service
    saveActiveTab(format);
  }, []);

  const handleClearAll = useCallback(() => {
    // Call the clear function from DiffChecker if it exists
    if (clearAllRef.current) {
      clearAllRef.current();
    }
  }, []);

  /**
   * Prevent flash of unstyled content during SSR
   * Show loading state until client-side hydration is complete
   * Also wait for activeView to be loaded from localStorage
   */
  if (!mounted || activeView === null) {
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
            onClearAll={handleClearAll}
          />

          {/* Content Container */}
          <ContentContainer>
            {/* Only render DiffChecker when activeView is properly loaded to prevent flash */}
            {activeView && (
              <DiffChecker 
                activeFormat={activeView}
                onClearAllRef={clearAllRef}
              />
            )}
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
          /* Instant theme switching for body */
          transition: none !important;
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

        /* Instant theme switching - disable color transitions globally for zero-lag theme switching */
        * {
          transition-property: background-color, border-color, box-shadow, transform, opacity !important;
          transition-duration: 0.2s !important;
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1) !important;
        }

        /* Explicitly disable color transitions for instant theme switching */
        *,
        *::before,
        *::after {
          transition-property: background-color, border-color, box-shadow, transform, opacity !important;
        }

        /* Instant theme switching for text editors and content areas - no transitions at all */
        textarea,
        [data-theme-content],
        [data-theme-editor],
        [data-theme-panel] {
          transition: none !important;
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

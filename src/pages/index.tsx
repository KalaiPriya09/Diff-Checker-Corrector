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
import { Alert } from '../components/Alert';
import { UrlModal } from '../components/UrlModal';
import { loadActiveTab, saveActiveTab } from '../services/appStorage';

// Modern styled components with enhanced visual design
const PageContainer = styled.div`
  min-height: 100vh;
  overflow-y: auto;
  overflow-x: hidden;
  background: ${(props) =>
    props.theme === darkTheme
      ? `radial-gradient(circle at 50% -20%, #2e1065 0%, #0b0d14 40%, #0b0d14 100%)`
      : `radial-gradient(circle at 50% 0%, ${props.theme.colors.purpleLight} 0%, ${props.theme.colors.background} 70%)`};
  font-family: ${(props) => props.theme.fonts.body};
  display: flex;
  flex-direction: column;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 100%;
    background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
    pointer-events: none;
    z-index: 0;
  }
`;


const ContentContainer = styled.div`
  flex: 1;
  padding: 24px 32px;
  padding-top: 70px; /* Header height + gap */
  margin: 0 auto;
  width: 100%;
  max-width: 1400px;
  position: relative;
  z-index: 1;

  @media (max-width: 1024px) {
    padding: 20px 24px;
    padding-top: 90px;
  }

  @media (max-width: 768px) {
    padding: 16px 20px;
    padding-top: 140px;
  }

  @media (max-width: 480px) {
    padding: 12px 16px;
    padding-top: 130px;
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

  // Alert state - lifted from DiffChecker for proper z-index stacking
  const [showAlert, setShowAlert] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

  // UrlModal state - lifted from DiffChecker for proper z-index stacking
  const [showUrlModal, setShowUrlModal] = useState(false);
  const urlLoadHandlerRef = useRef<((url: string) => Promise<void>) | null>(null);

  // Alert handler to pass to DiffChecker
  const handleShowAlert = useCallback((title: string, message: string) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setShowAlert(true);
  }, []);

  // UrlModal handler to pass to DiffChecker
  const handleShowUrlModal = useCallback(() => {
    setShowUrlModal(true);
  }, []);

  // Handle URL load from modal - delegates to DiffChecker's handler
  const handleUrlLoad = useCallback(async (url: string) => {
    if (urlLoadHandlerRef.current) {
      await urlLoadHandlerRef.current(url);
    }
  }, []);

  // Get sample URL based on active view
  const getSampleUrl = useCallback(() => {
    if (activeView?.includes('json')) {
      return 'https://gist.githubusercontent.com/cbmgit/852c2702d4342e7811c95f8ffc2f017f/raw/InsuranceCompanies.json';
    } else if (activeView?.includes('xml')) {
      return 'https://gist.githubusercontent.com/cbmgit/852c2e549f35e1a73e9410259d8b87e5/raw/852c2e549f35e1a73e9410259d8b87e5.xml';
    }
    return 'https://example.com/data.txt';
  }, [activeView]);

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
        <meta name="theme-color" content={currentTheme.colors.background} />
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
                onShowAlert={handleShowAlert}
                onShowUrlModal={handleShowUrlModal}
                onUrlLoadRef={urlLoadHandlerRef}
              />
            )}
          </ContentContainer>

          {/* UrlModal rendered at PageContainer level - properly covers Header */}
          <UrlModal
            show={showUrlModal}
            onClose={() => setShowUrlModal(false)}
            onLoad={handleUrlLoad}
            title="Load URL"
            sampleUrl={getSampleUrl()}
            viewType={activeView || undefined}
          />

          {/* Alert rendered at PageContainer level - properly covers Header */}
          <Alert
            show={showAlert}
            title={alertTitle}
            message={alertMessage}
            onClose={() => setShowAlert(false)}
          />
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

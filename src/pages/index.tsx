import Head from 'next/head';
import React, { useState, useCallback } from 'react';
import { ViewType } from '../components/Sidebar';
import { Header } from '../components/Header';
import { Tabs } from '../components/Tabs';
import { JSONValidator, XMLValidator } from '../components/Validator';
import { JSONCompare, XMLCompare, TextCompare } from '../components/Compare';
import styled from 'styled-components';

const MainContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: ${props => props.theme.colors.background};
  transition: background-color 0.3s ease;
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
  const [activeView, setActiveView] = useState<ViewType>('json-validate');
  const [clearKey, setClearKey] = useState(0);

  const handleClearAll = useCallback(() => {
    setClearKey(prev => prev + 1);
    setActiveView('json-validate');
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

  return (
    <>
      <Head>
        <title>Checker & Corrector</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <MainContainer>
        <Header onClearAll={handleClearAll} />
        <ContentWrapper>
          <ContentCard>
            <Tabs activeView={activeView} onViewChange={setActiveView} />
            {renderView()}
          </ContentCard>
        </ContentWrapper>
      </MainContainer>
    </>
  );
}


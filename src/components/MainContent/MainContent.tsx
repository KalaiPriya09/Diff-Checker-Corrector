import React from 'react';
import { ViewType } from '../Sidebar';
import { JSONValidator, XMLValidator } from '../Validator';
import { JSONCompare, XMLCompare, TextCompare } from '../Compare';
import { MainContentContainer } from './MainContent.styles';

interface MainContentProps {
  activeView: ViewType;
}

export const MainContent: React.FC<MainContentProps> = ({ activeView }) => {
  const renderView = () => {
    switch (activeView) {
      case 'json-validate':
        return <JSONValidator />;
      case 'xml-validate':
        return <XMLValidator />;
      case 'json-compare':
        return <JSONCompare />;
      case 'xml-compare':
        return <XMLCompare />;
      case 'text-compare':
        return <TextCompare />;
      default:
        return <JSONValidator />;
    }
  };

  return <MainContentContainer>{renderView()}</MainContentContainer>;
};

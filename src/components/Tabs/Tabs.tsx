import React from 'react';
import { ViewType } from '../Sidebar';
import { TabsContainer, Tab } from './Tabs.styles';

interface TabsProps {
  activeView: ViewType;
  onViewChange: (view: ViewType) => void;
}

const tabs: Array<{ id: ViewType; label: string }> = [
  { id: 'json-validate', label: 'JSON Validate' },
  { id: 'json-compare', label: 'JSON Compare' },
  { id: 'xml-validate', label: 'XML Validate' },
  { id: 'xml-compare', label: 'XML Compare' },
  { id: 'text-compare', label: 'Text Compare' },
];

export const Tabs: React.FC<TabsProps> = ({ activeView, onViewChange }) => {
  return (
    <TabsContainer>
      {tabs.map(tab => (
        <Tab
          key={tab.id}
          isActive={activeView === tab.id}
          onClick={() => onViewChange(tab.id)}
        >
          {tab.label}
        </Tab>
      ))}
    </TabsContainer>
  );
};
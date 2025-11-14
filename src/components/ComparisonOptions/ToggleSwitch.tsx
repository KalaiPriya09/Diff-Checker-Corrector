import React from 'react';
import styled from 'styled-components';

const ToggleContainer = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
`;

const ToggleSwitch = styled.div<{ isOn: boolean }>`
  width: 48px;
  height: 24px;
  background-color: ${props => props.isOn ? '#79589b' : '#d1d5db'};
  border-radius: 12px;
  position: relative;
  transition: background-color 0.2s;
  
  &::after {
    content: '';
    position: absolute;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background-color: #ffffff;
    top: 2px;
    left: ${props => props.isOn ? '26px' : '2px'};
    transition: left 0.2s;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
`;

const ToggleLabel = styled.span`
  font-size: 14px;
  color: ${props => props.theme.colors.text};
  font-weight: 400;
  transition: color 0.3s ease;
`;

interface ToggleSwitchProps {
  label: string;
  isOn: boolean;
  onChange: (checked: boolean) => void;
}

export const ToggleSwitchComponent: React.FC<ToggleSwitchProps> = ({
  label,
  isOn,
  onChange,
}) => {
  return (
    <ToggleContainer>
      <input
        type="checkbox"
        checked={isOn}
        onChange={(e) => onChange(e.target.checked)}
        style={{ display: 'none' }}
      />
      <ToggleSwitch isOn={isOn} />
      <ToggleLabel>{label}</ToggleLabel>
    </ToggleContainer>
  );
};

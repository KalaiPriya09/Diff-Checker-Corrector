import React from 'react';
import { OptionsContainer, OptionItem } from './ComparisonOptions.styles';
import { ToggleSwitchComponent } from './ToggleSwitch';

export interface ComparisonOptions {
  caseSensitive: boolean;
  ignoreWhitespace: boolean;
  ignoreKeyOrder?: boolean;
  ignoreAttributeOrder?: boolean;
}

interface ComparisonOptionsProps {
  options: ComparisonOptions;
  onChange: (options: ComparisonOptions) => void;
  showKeyOrder?: boolean;
  showAttributeOrder?: boolean;
}

export const ComparisonOptionsComponent: React.FC<ComparisonOptionsProps> = ({
  options,
  onChange,
  showKeyOrder = false,
  showAttributeOrder = false,
}) => {
  const handleToggle = (key: keyof ComparisonOptions) => {
    onChange({
      ...options,
      [key]: !options[key],
    });
  };

  return (
    <OptionsContainer>
      <OptionItem>
        <ToggleSwitchComponent
          label="Ignore Whitespace"
          isOn={options.ignoreWhitespace}
          onChange={() => handleToggle('ignoreWhitespace')}
        />
      </OptionItem>
      
      <OptionItem>
        <ToggleSwitchComponent
          label="Case Sensitive"
          isOn={options.caseSensitive}
          onChange={() => handleToggle('caseSensitive')}
        />
      </OptionItem>
      
      {showKeyOrder && (
        <OptionItem>
          <ToggleSwitchComponent
            label="Ignore Key Order"
            isOn={options.ignoreKeyOrder || false}
            onChange={() => handleToggle('ignoreKeyOrder')}
          />
        </OptionItem>
      )}
      
      {showAttributeOrder && (
        <OptionItem>
          <ToggleSwitchComponent
            label="Ignore Attribute Order"
            isOn={options.ignoreAttributeOrder || false}
            onChange={() => handleToggle('ignoreAttributeOrder')}
          />
        </OptionItem>
      )}
    </OptionsContainer>
  );
};

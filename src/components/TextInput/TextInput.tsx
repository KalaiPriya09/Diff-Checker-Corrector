import React, { forwardRef } from 'react';
import {
  textInputContainerStyle,
  textInputLabelStyle,
  getTextInputStyle,
  textInputHelperStyle,
  textInputErrorStyle,
} from './TextInput.styles';
import { useTextInput } from './useTextInput';

export type TextInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  helperText?: string;
  errorText?: string;
};

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  ({ id, label, helperText, errorText, style, ...rest }, ref) => {
    const inputId = id ?? rest.name ?? 'text-input';
    const { hasError } = useTextInput(errorText);
    return (
      <div style={textInputContainerStyle}>
        {label ? (
          <label htmlFor={inputId} style={textInputLabelStyle}>
            {label}
          </label>
        ) : null}
        <input
          id={inputId}
          ref={ref}
          style={{ ...getTextInputStyle(hasError), ...style }}
          aria-invalid={hasError}
          {...rest}
        />
        {hasError ? (
          <span style={textInputErrorStyle}>{errorText}</span>
        ) : helperText ? (
          <span style={textInputHelperStyle}>{helperText}</span>
        ) : null}
      </div>
    );
  },
);

TextInput.displayName = 'TextInput';


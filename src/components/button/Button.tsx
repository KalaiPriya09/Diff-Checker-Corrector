import React from 'react';
import { StyledButton, ButtonVariant } from './Button.styles';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  variant?: ButtonVariant;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  disabled,
  variant = 'primary',
  ...rest
}) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled && onClick) {
      onClick(e);
    }
  };

  return (
    <StyledButton
      onClick={handleClick}
      disabled={disabled}
      $variant={variant}
      $disabled={disabled}
      {...rest}
    >
      {children}
    </StyledButton>
  );
};


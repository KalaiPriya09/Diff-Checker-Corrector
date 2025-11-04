import React from 'react';
import { SpinnerEl } from './Spinner.styles';

export type SpinnerProps = {
  size?: number;
  color?: string;
};

export const Spinner: React.FC<SpinnerProps> = ({ size = 18, color = '#111827' }) => {
  const borderSize = Math.max(2, Math.round(size / 9));
  return <SpinnerEl aria-label="Loading" size={size} color={color} borderSize={borderSize} />;
};


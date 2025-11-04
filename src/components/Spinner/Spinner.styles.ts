import styled, { keyframes } from 'styled-components';

const rotate = keyframes`
  to { transform: rotate(360deg); }
`;

export const SpinnerEl = styled.span<{ size: number; color: string; borderSize: number }>`
  display: inline-block;
  width: ${({ size }) => size}px;
  height: ${({ size }) => size}px;
  border-radius: 50%;
  border: ${({ borderSize }) => borderSize}px solid ${({ theme }) => theme.colors.border};
  border-top-color: ${({ color }) => color};
  animation: ${rotate} 0.8s linear infinite;
`;


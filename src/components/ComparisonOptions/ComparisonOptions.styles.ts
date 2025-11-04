import styled from 'styled-components';

export const OptionsContainer = styled.div`
  display: flex;
  gap: 24px;
  align-items: center;
  padding: 0;
  background-color: transparent;
  margin-bottom: 0;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    gap: 16px;
  }
  
  @media (max-width: 480px) {
    gap: 12px;
  }
`;

export const OptionItem = styled.div`
  display: flex;
  align-items: center;
  color: ${props => props.theme.colors.text};
  transition: color 0.3s ease;
`;
import React from 'react';
import type { JsonValidationResult, XmlValidationResult } from '../../types/common';
import {
  ResultSection,
  ErrorResultSection,
  ResultIcon,
  ResultContent,
  ResultTitle,
  ErrorTitle,
  ResultMessage,
  ErrorMessage,
  ErrorDetails,
} from './Validator.styles';

type ValidationResult = JsonValidationResult | XmlValidationResult;

interface ValidatorResultsProps {
  result: ValidationResult | null;
  hasValidated: boolean;
}

export const ValidatorResults: React.FC<ValidatorResultsProps> = ({
  result,
  hasValidated,
}) => {
  if (!hasValidated || !result) {
    return null;
  }

  if (result.isValid) {
    return (
      <ResultSection>
        <ResultIcon isError={false}>✓</ResultIcon>
        <ResultContent>
          <ResultTitle>Validation Successful</ResultTitle>
          <ResultMessage>Your content is valid and well-formed.</ResultMessage>
        </ResultContent>
      </ResultSection>
    );
  }

  return (
    <ErrorResultSection>
      <ResultIcon isError={true}>✗</ResultIcon>
      <ResultContent>
        <ErrorTitle>Validation Failed</ErrorTitle>
        <ErrorMessage>{result.error || 'Invalid content'}</ErrorMessage>
        {result.position && (
          <ErrorDetails>
            Position: Line {result.position.line}, Column {result.position.column}
          </ErrorDetails>
        )}
      </ResultContent>
    </ErrorResultSection>
  );
};


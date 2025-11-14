import { useMemo } from 'react';

export const useTextInput = (errorText?: string) => {
  const hasError = useMemo(() => Boolean(errorText), [errorText]);
  return { hasError } as const;
};


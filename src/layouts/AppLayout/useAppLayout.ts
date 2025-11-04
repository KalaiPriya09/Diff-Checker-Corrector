import { useMemo } from 'react';

export const useAppLayout = () => {
  const appTitle = useMemo(() => 'App Layout', []);
  return { appTitle } as const;
};


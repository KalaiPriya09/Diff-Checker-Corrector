import { useCallback, useState } from 'react';

export const useBoolean = (initial = false) => {
  const [value, setValue] = useState<boolean>(initial);
  const on = useCallback(() => setValue(true), []);
  const off = useCallback(() => setValue(false), []);
  const toggle = useCallback(() => setValue((v) => !v), []);
  return { value, on, off, toggle } as const;
};


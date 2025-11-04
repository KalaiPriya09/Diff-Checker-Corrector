import { useState } from 'react';

export const useTabs = (defaultKey?: string) => {
  const [activeKey, setActiveKey] = useState<string | undefined>(defaultKey);
  return { activeKey, setActiveKey } as const;
};


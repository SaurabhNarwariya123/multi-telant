'use client';

import { useCallback, useEffect, useState } from 'react';
import { api } from './api';

export function useItem(path) {
  const [item, setItem] = useState(null);

  const reload = useCallback(() => api(path).then(setItem).catch(() => setItem(null)), [path]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { item, reload };
}

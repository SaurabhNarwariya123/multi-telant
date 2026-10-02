'use client';

import { useCallback, useEffect, useState } from 'react';
import { api } from './api';

export function useList(path) {
  const [items, setItems] = useState([]);

  const reload = useCallback(() => {
    if (!path) return Promise.resolve();
    return api(path).then(setItems).catch(() => setItems([]));
  }, [path]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { items, reload };
}

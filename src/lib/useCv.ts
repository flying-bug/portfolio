import { useEffect, useState } from 'react';
import type { CV } from '../types';

export function useCv() {
  const [cv, setCv] = useState<CV | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}cv.json`, { cache: 'no-cache' })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json() as Promise<CV>;
      })
      .then(setCv)
      .catch((e: Error) => setError(e.message));
  }, []);

  return { cv, error };
}

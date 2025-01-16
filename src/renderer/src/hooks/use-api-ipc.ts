import { useEffect, useState } from 'react';

export function useApiIpc<T>(callback: () => Promise<T>) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);

  const call = async () => {
    setLoading(true);
    const result = await callback();
    setLoading(false);
    return result;
  };

  useEffect(() => {
    void call().then(setData).catch(setError);
  }, []);

  return { loading, data, error, refresh: async () => await call() };
}

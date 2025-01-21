import { useEffect, useState } from 'react';

export function useApiIpc<T>(callback: () => Promise<T>) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);

  const call = async () => {
    try {
      setLoading(true);
      const result = await callback();
      setData(result);
      setLoading(false);
      return result;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void call().then(setData).catch(setError);
  }, []);

  return { loading, data, error, refresh: call };
}

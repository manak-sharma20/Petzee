import { useState, useEffect, useCallback } from 'react';

/**
 * Generic data fetching hook.
 * Usage: const { data, loading, error, refetch } = useFetch(apiFn, [...deps])
 */
export const useFetch = (apiFn, deps = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFn();
      setData(res.data.data ?? res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch };
};

/**
 * Mutation hook – for POST/PUT/PATCH/DELETE actions.
 * Usage: const { mutate, loading, error } = useMutation(apiFn)
 */
export const useMutation = (apiFn) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFn(...args);
      return res.data.data ?? res.data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Something went wrong';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, [apiFn]);

  return { mutate, loading, error };
};

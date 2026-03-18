'use client';
import { useState, useCallback } from 'react';
import { apiFetch } from '@/lib/api';

export function useMetabolic() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const calculate = useCallback(async (patientData) => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiFetch('/api/metabolic/calculate', { method: 'POST', body: patientData });
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getHistory = useCallback(async () => {
    const data = await apiFetch('/api/metabolic/history');
    return data;
  }, []);

  return { calculate, getHistory, loading, error };
}

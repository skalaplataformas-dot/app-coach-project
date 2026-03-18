'use client';
import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '@/lib/api';

export function useNutrition() {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPlan = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch('/api/nutrition/plan');
      setPlan(data);
    } catch (err) {
      setPlan(null);
      setError(err.message);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchPlan(); }, [fetchPlan]);

  const generatePlan = useCallback(async (params) => {
    const data = await apiFetch('/api/nutrition/plan', { method: 'POST', body: params });
    setPlan(data);
    return data;
  }, []);

  return { plan, loading, error, refetch: fetchPlan, generatePlan };
}

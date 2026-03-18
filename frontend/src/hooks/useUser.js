'use client';
import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '@/lib/api';

export function useUser() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUser = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [userData, statsData] = await Promise.all([
        apiFetch('/api/users/me').catch(() => null),
        apiFetch('/api/users/me/stats').catch(() => null),
      ]);
      setUser(userData);
      setStats(statsData);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchUser(); }, [fetchUser]);

  const updateProfile = useCallback(async (data) => {
    const updated = await apiFetch('/api/users/me', { method: 'PUT', body: data });
    setUser(updated);
    return updated;
  }, []);

  return { user, stats, loading, error, refetch: fetchUser, updateProfile };
}

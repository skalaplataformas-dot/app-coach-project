'use client';
import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '@/lib/api';

export function useWorkouts(initialCategory = 'all') {
  const [workouts, setWorkouts] = useState([]);
  const [category, setCategory] = useState(initialCategory);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWorkouts = useCallback(async (cat) => {
    setLoading(true);
    setError(null);
    try {
      const params = cat && cat !== 'all' ? `?category=${cat}` : '';
      const data = await apiFetch(`/api/workouts${params}`);
      setWorkouts(data);
    } catch (err) {
      setWorkouts([]);
      setError(err.message);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchWorkouts(category); }, [category, fetchWorkouts]);

  const changeCategory = useCallback((cat) => {
    setCategory(cat);
  }, []);

  const completeWorkout = useCallback(async (workoutId) => {
    await apiFetch(`/api/workouts/${workoutId}/complete`, { method: 'POST', body: {} });
  }, []);

  return { workouts, category, loading, error, changeCategory, completeWorkout, refetch: () => fetchWorkouts(category) };
}

export function useWorkoutDetail(id) {
  const [workout, setWorkout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    apiFetch(`/api/workouts/${id}`)
      .then(setWorkout)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  return { workout, setWorkout, loading, error };
}

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { useToast } from '@/context/ToastContext';

export default function WorkoutDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const toast = useToast();
  const [workout, setWorkout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    apiFetch(`/api/workouts/${id}`)
      .then(setWorkout)
      .catch(() => router.push('/workouts'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleComplete = async () => {
    setCompleting(true);
    try {
      await apiFetch(`/api/workouts/${id}/complete`, { method: 'POST', body: {} });
      setWorkout(prev => ({ ...prev, last_completed: new Date().toISOString() }));
      toast.success('Entrenamiento completado!');
    } catch (e) {
      toast.error(e.message || 'Error al completar');
    }
    setCompleting(false);
  };

  if (loading) return <div className="text-gray-400 text-center py-12">Cargando...</div>;
  if (!workout) return null;

  return (
    <div className="max-w-2xl">
      <button onClick={() => router.push('/workouts')} className="text-gray-400 hover:text-white mb-4 text-sm">
        &larr; Volver a entrenamientos
      </button>

      <h1 className="text-2xl font-bold mb-2">{workout.title}</h1>
      <p className="text-gray-400 mb-6">{workout.description}</p>

      <div className="flex gap-4 mb-6 text-sm">
        <span className="bg-dark-600 px-3 py-1 rounded-full">{workout.duration_minutes} min</span>
        <span className="bg-dark-600 px-3 py-1 rounded-full capitalize">{workout.difficulty}</span>
        <span className="bg-dark-600 px-3 py-1 rounded-full capitalize">{workout.category}</span>
      </div>

      {workout.last_completed && (
        <div className="bg-primary/10 border border-primary/30 rounded-xl px-4 py-3 mb-6 text-sm text-primary">
          Completado: {new Date(workout.last_completed).toLocaleDateString('es')}
        </div>
      )}

      {/* Exercises */}
      <h2 className="text-lg font-bold mb-4">Ejercicios</h2>
      <div className="space-y-3 mb-8">
        {workout.exercises?.map((ex, i) => (
          <div key={ex.id} className="card flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-dark-600 flex items-center justify-center text-sm font-bold text-primary">
              {i + 1}
            </div>
            <div className="flex-1">
              <div className="font-medium">{ex.name}</div>
              <div className="text-sm text-gray-400">
                {ex.sets} series x {ex.reps}
                {ex.rest_seconds ? ` | ${ex.rest_seconds}s descanso` : ''}
              </div>
              {ex.notes && <div className="text-xs text-gray-500 mt-1">{ex.notes}</div>}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={handleComplete}
        disabled={completing}
        className="btn-primary w-full text-lg disabled:opacity-50"
      >
        {completing ? 'Completando...' : 'Marcar como Completado'}
      </button>
    </div>
  );
}

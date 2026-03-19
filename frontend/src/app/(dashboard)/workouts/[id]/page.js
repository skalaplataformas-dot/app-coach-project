'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { useToast } from '@/context/ToastContext';

const DIFFICULTY_LABELS = { beginner: 'Principiante', intermediate: 'Intermedio', advanced: 'Avanzado' };
const DIFFICULTY_COLORS = {
  beginner: 'bg-green-400/10 text-green-400',
  intermediate: 'bg-yellow-400/10 text-yellow-400',
  advanced: 'bg-red-400/10 text-red-400',
};
const CATEGORY_LABELS = { strength: 'Fuerza', cardio: 'Cardio', hiit: 'HIIT', flexibility: 'Flexibilidad' };

const MUSCLE_COLORS = {
  chest: { bg: 'bg-green-400/10', text: 'text-green-400', border: 'border-green-400/20', dot: 'bg-green-400' },
  back: { bg: 'bg-blue-400/10', text: 'text-blue-400', border: 'border-blue-400/20', dot: 'bg-blue-400' },
  legs: { bg: 'bg-cyan-400/10', text: 'text-cyan-400', border: 'border-cyan-400/20', dot: 'bg-cyan-400' },
  shoulders: { bg: 'bg-orange-400/10', text: 'text-orange-400', border: 'border-orange-400/20', dot: 'bg-orange-400' },
  arms: { bg: 'bg-purple-400/10', text: 'text-purple-400', border: 'border-purple-400/20', dot: 'bg-purple-400' },
  core: { bg: 'bg-yellow-400/10', text: 'text-yellow-400', border: 'border-yellow-400/20', dot: 'bg-yellow-400' },
  cardio: { bg: 'bg-red-400/10', text: 'text-red-400', border: 'border-red-400/20', dot: 'bg-red-400' },
  flexibility: { bg: 'bg-emerald-400/10', text: 'text-emerald-400', border: 'border-emerald-400/20', dot: 'bg-emerald-400' },
};

const MUSCLE_LABELS = {
  chest: 'Pecho', back: 'Espalda', legs: 'Piernas', shoulders: 'Hombros',
  arms: 'Brazos', core: 'Core', cardio: 'Cardio', flexibility: 'Flexibilidad',
};

export default function WorkoutDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const toast = useToast();
  const [workout, setWorkout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [expandedExercise, setExpandedExercise] = useState(null);

  useEffect(() => {
    apiFetch(`/api/workouts/${id}`)
      .then(setWorkout)
      .catch(() => { toast.error('Error al cargar el entrenamiento'); })
      .finally(() => setLoading(false));
  }, [id]);

  const handleComplete = async () => {
    setCompleting(true);
    try {
      await apiFetch(`/api/workouts/${id}/complete`, { method: 'POST', body: {} });
      toast.success('Entrenamiento completado!');
      setWorkout(prev => ({ ...prev, last_completed: new Date().toISOString() }));
    } catch {
      toast.error('Error al registrar entrenamiento');
    } finally {
      setCompleting(false);
    }
  };

  if (loading) return <div className="text-gray-400 text-center py-12">Cargando entrenamiento...</div>;
  if (!workout) return <div className="text-gray-400 text-center py-12">Entrenamiento no encontrado</div>;

  const exercises = workout.exercises || [];

  return (
    <div className="max-w-2xl mx-auto">
      {/* Back button */}
      <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Volver
      </button>

      {/* Header */}
      <div className="card mb-6">
        <div className="flex items-start justify-between mb-3">
          <h1 className="text-2xl font-bold">{workout.title}</h1>
          {workout.last_completed && (
            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-lg flex-shrink-0">
              Completado
            </span>
          )}
        </div>
        <p className="text-gray-400 text-sm mb-4">{workout.description}</p>

        <div className="flex flex-wrap gap-2">
          <span className={`text-xs font-bold px-3 py-1 rounded-full ${DIFFICULTY_COLORS[workout.difficulty]}`}>
            {DIFFICULTY_LABELS[workout.difficulty]}
          </span>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-dark-500 text-gray-300">
            {CATEGORY_LABELS[workout.category] || workout.category}
          </span>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-dark-500 text-gray-300">
            {workout.duration_minutes} min
          </span>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-dark-500 text-gray-300">
            {exercises.length} ejercicios
          </span>
        </div>

        {workout.last_completed && (
          <p className="text-xs text-gray-500 mt-3">
            Ultimo: {new Date(workout.last_completed).toLocaleDateString('es-CO', {
              day: 'numeric', month: 'short', year: 'numeric'
            })}
          </p>
        )}
      </div>

      {/* Exercise List */}
      <h2 className="text-lg font-bold mb-4">Ejercicios</h2>
      <div className="space-y-3 mb-8">
        {exercises.map((ex, idx) => (
          <ExerciseCard
            key={ex.id || idx}
            exercise={ex}
            index={idx}
            expanded={expandedExercise === idx}
            onToggle={() => setExpandedExercise(expandedExercise === idx ? null : idx)}
          />
        ))}
      </div>

      {/* Complete Button */}
      <button
        onClick={handleComplete}
        disabled={completing}
        className="w-full py-4 bg-primary text-dark-900 font-bold rounded-2xl text-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
      >
        {completing ? 'Registrando...' : 'Completar Entrenamiento'}
      </button>
    </div>
  );
}

// ─── Exercise Card ────────────────────────────────────────────────────────

function ExerciseCard({ exercise, index, expanded, onToggle }) {
  const [gifError, setGifError] = useState(false);
  const mc = MUSCLE_COLORS[exercise.muscle_group] || MUSCLE_COLORS.cardio;
  const muscleLabel = MUSCLE_LABELS[exercise.muscle_group] || exercise.muscle_group_label || '';
  const hasMedia = exercise.gif_url && !gifError;

  return (
    <div className={`rounded-2xl border transition-all overflow-hidden ${
      expanded ? `border-primary/30 bg-dark-800` : 'border-dark-500 bg-dark-800'
    }`}>
      {/* Header */}
      <button onClick={onToggle} className="w-full p-4 flex items-center gap-4 text-left">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-sm ${
          expanded ? 'bg-primary/15 text-primary' : 'bg-dark-600 text-gray-400'
        }`}>
          {index + 1}
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate">{exercise.name}</p>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs text-gray-400">
              {exercise.sets} × {exercise.reps}
            </span>
            {exercise.rest_seconds > 0 && (
              <span className="text-xs text-gray-500">
                {exercise.rest_seconds}s
              </span>
            )}
            {muscleLabel && (
              <>
                <div className={`w-1.5 h-1.5 rounded-full ${mc.dot}`} />
                <span className={`text-xs ${mc.text}`}>{muscleLabel}</span>
              </>
            )}
          </div>
        </div>

        <svg
          className={`w-4 h-4 text-gray-500 transition-transform flex-shrink-0 ${expanded ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Expanded */}
      {expanded && (
        <div className="px-4 pb-4 space-y-4">
          {/* GIF */}
          {exercise.gif_url && !gifError && (
            <div className="rounded-xl overflow-hidden bg-black border border-dark-500">
              <img
                src={exercise.gif_url}
                alt={exercise.name}
                className="w-full aspect-[4/3] object-contain"
                loading="lazy"
                onError={() => setGifError(true)}
              />
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-dark-700/50 rounded-xl p-3 text-center">
              <div className="text-xl font-bold text-primary">{exercise.sets}</div>
              <div className="text-[10px] uppercase tracking-wider text-gray-500">Series</div>
            </div>
            <div className="bg-dark-700/50 rounded-xl p-3 text-center">
              <div className="text-xl font-bold text-white">{exercise.reps}</div>
              <div className="text-[10px] uppercase tracking-wider text-gray-500">Reps</div>
            </div>
            <div className="bg-dark-700/50 rounded-xl p-3 text-center">
              <div className="text-xl font-bold text-gray-300">{exercise.rest_seconds || 0}s</div>
              <div className="text-[10px] uppercase tracking-wider text-gray-500">Descanso</div>
            </div>
          </div>

          {/* Notes */}
          {exercise.notes && (
            <div className="bg-dark-700/50 rounded-xl p-3">
              <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">Notas</p>
              <p className="text-sm text-gray-300">{exercise.notes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

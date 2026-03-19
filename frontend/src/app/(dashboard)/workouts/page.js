'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { TOASTS } from '@/config/coach-voice';
import Link from 'next/link';

const CATEGORIES = ['all', 'strength', 'cardio', 'hiit', 'flexibility'];
const CATEGORY_LABELS = { all: 'Todos', strength: 'Fuerza', cardio: 'Cardio', hiit: 'HIIT', flexibility: 'Flexibilidad' };
const DIFFICULTY_COLORS = { beginner: 'text-green-400', intermediate: 'text-yellow-400', advanced: 'text-red-400' };
const DIFFICULTY_LABELS = { beginner: 'Principiante', intermediate: 'Intermedio', advanced: 'Avanzado' };

export default function WorkoutsPage() {
  const toast = useToast();
  const [workouts, setWorkouts] = useState([]);
  const [category, setCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = category !== 'all' ? `?category=${category}` : '';
    apiFetch(`/api/workouts${params}`)
      .then(setWorkouts)
      .catch(() => { toast.error(TOASTS.error_workouts); setWorkouts([]); })
      .finally(() => setLoading(false));
  }, [category]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Entrenamientos</h1>

      {/* Category Filter */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => { setCategory(cat); setLoading(true); }}
            className={`px-4 py-2 rounded-full text-sm transition-colors ${
              category === cat
                ? 'bg-primary text-black font-bold'
                : 'bg-dark-600 text-gray-300 hover:bg-dark-500'
            }`}
          >
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-gray-400 text-center py-12">Cargando entrenamientos...</div>
      ) : workouts.length === 0 ? (
        <div className="text-gray-400 text-center py-12">No hay entrenamientos disponibles</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workouts.map((w) => (
            <Link key={w.id} href={`/workouts/${w.id}`}>
              <div className="card hover:border-primary transition-colors cursor-pointer">
                <h3 className="font-bold text-lg mb-2">{w.title}</h3>
                <p className="text-sm text-gray-400 mb-3 line-clamp-2">{w.description}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className={DIFFICULTY_COLORS[w.difficulty]}>
                    {DIFFICULTY_LABELS[w.difficulty]}
                  </span>
                  <span className="text-gray-500">{w.duration_minutes} min</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

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

const DAY_NAMES = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

export default function WorkoutsPage() {
  const toast = useToast();
  const [workouts, setWorkouts] = useState([]);
  const [category, setCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [todaySchedule, setTodaySchedule] = useState([]);
  const [weekSchedule, setWeekSchedule] = useState([]);
  const [completing, setCompleting] = useState(null);

  useEffect(() => {
    // Load schedule
    apiFetch('/api/workouts/schedule/today').then(setTodaySchedule).catch(() => {});
    apiFetch('/api/workouts/schedule/week').then(setWeekSchedule).catch(() => {});
  }, []);

  useEffect(() => {
    const params = category !== 'all' ? `?category=${category}` : '';
    apiFetch(`/api/workouts${params}`)
      .then(setWorkouts)
      .catch(() => { toast.error(TOASTS.error_workouts); setWorkouts([]); })
      .finally(() => setLoading(false));
  }, [category]);

  const handleComplete = async (scheduleId) => {
    setCompleting(scheduleId);
    try {
      await apiFetch(`/api/workouts/schedule/${scheduleId}/complete`, { method: 'PUT' });
      toast.success(TOASTS.workout_completed);
      // Refresh
      const [today, week] = await Promise.all([
        apiFetch('/api/workouts/schedule/today'),
        apiFetch('/api/workouts/schedule/week'),
      ]);
      setTodaySchedule(today);
      setWeekSchedule(week);
    } catch {
      toast.error(TOASTS.error_save);
    } finally {
      setCompleting(null);
    }
  };

  // Build week calendar
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const dayOfWeek = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const scheduled = weekSchedule.filter(s => s.scheduled_date === dateStr);
    const isToday = dateStr === todayStr;
    return { date: d, dateStr, dayName: DAY_NAMES[i], scheduled, isToday };
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Entrenamientos</h1>

      {/* Today's Workout */}
      {todaySchedule.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm uppercase tracking-wider text-gray-500 mb-3">Entrenamiento de hoy</h2>
          <div className="space-y-3">
            {todaySchedule.map(s => (
              <div key={s.id} className={`card border-l-4 ${s.completed ? 'border-l-green-500 opacity-75' : 'border-l-primary'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-lg">{s.workouts?.title || 'Entrenamiento'}</h3>
                    <div className="flex gap-3 mt-1 text-sm text-gray-400">
                      {s.workouts?.category && <span className="capitalize">{CATEGORY_LABELS[s.workouts.category] || s.workouts.category}</span>}
                      {s.workouts?.duration_minutes && <span>{s.workouts.duration_minutes} min</span>}
                      {s.workouts?.difficulty && <span className={DIFFICULTY_COLORS[s.workouts.difficulty]}>{DIFFICULTY_LABELS[s.workouts.difficulty]}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {s.completed ? (
                      <span className="flex items-center gap-1 text-green-400 text-sm font-bold">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        Completado
                      </span>
                    ) : (
                      <>
                        <Link href={`/workouts/${s.workouts?.id}`}
                          className="text-sm text-primary hover:underline">
                          Ver detalle
                        </Link>
                        <button onClick={() => handleComplete(s.id)} disabled={completing === s.id}
                          className="btn-primary px-4 py-2 text-sm disabled:opacity-50">
                          {completing === s.id ? 'Completando...' : 'Completar'}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Weekly Calendar */}
      <div className="mb-6">
        <h2 className="text-sm uppercase tracking-wider text-gray-500 mb-3">Esta semana</h2>
        <div className="grid grid-cols-7 gap-1">
          {weekDays.map(day => (
            <div key={day.dateStr}
              className={`rounded-xl p-2 text-center transition-colors ${
                day.isToday ? 'bg-primary/10 border border-primary/30' : 'bg-dark-700/50'
              }`}>
              <div className={`text-[10px] uppercase ${day.isToday ? 'text-primary font-bold' : 'text-gray-500'}`}>
                {day.dayName}
              </div>
              <div className={`text-sm font-bold mb-1 ${day.isToday ? 'text-white' : 'text-gray-300'}`}>
                {day.date.getDate()}
              </div>
              {day.scheduled.length > 0 ? (
                day.scheduled.map(s => (
                  <div key={s.id} className={`text-[8px] rounded px-1 py-0.5 mt-0.5 truncate ${
                    s.completed ? 'bg-green-500/20 text-green-400' : 'bg-primary/10 text-primary'
                  }`}>
                    {s.completed ? '✓' : ''} {s.workouts?.title?.split(' ')[0] || '•'}
                  </div>
                ))
              ) : (
                <div className="text-[8px] text-gray-600 mt-0.5">Descanso</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* All Workouts Catalog */}
      <h2 className="text-sm uppercase tracking-wider text-gray-500 mb-3">Catálogo de entrenamientos</h2>

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

'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { useUser } from '@/hooks/useUser';
import { useToast } from '@/context/ToastContext';
import { TOASTS } from '@/config/coach-voice';
import Link from 'next/link';

const DIFFICULTY_COLORS = { beginner: 'text-green-400', intermediate: 'text-yellow-400', advanced: 'text-red-400' };
const DIFFICULTY_LABELS = { beginner: 'Principiante', intermediate: 'Intermedio', advanced: 'Avanzado' };
const DAY_NAMES = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

const MUSCLE_GROUPS = [
  { key: 'all', label: 'Todos' },
  { key: 'pecho_triceps', label: 'Pecho y Tríceps', icon: '💪' },
  { key: 'pecho_hombros_triceps', label: 'Push (Pecho/Hombros/Tríceps)', icon: '🏋️' },
  { key: 'espalda_biceps', label: 'Espalda y Bíceps', icon: '🔙' },
  { key: 'hombros', label: 'Hombros', icon: '🤸' },
  { key: 'piernas', label: 'Piernas', icon: '🦵' },
  { key: 'abdominales', label: 'Abdominales', icon: '🎯' },
  { key: 'full_body', label: 'Full Body', icon: '⚡' },
  { key: 'cardio', label: 'Cardio / HIIT', icon: '❤️' },
  { key: 'flexibilidad', label: 'Flexibilidad', icon: '🧘' },
];

export default function WorkoutsPage() {
  const toast = useToast();
  const { user } = useUser();
  const isAdmin = user?.role === 'admin';

  const [todaySchedule, setTodaySchedule] = useState([]);
  const [weekSchedule, setWeekSchedule] = useState([]);
  const [completing, setCompleting] = useState(null);
  const [loadingSchedule, setLoadingSchedule] = useState(true);

  // Admin catalog state
  const [workouts, setWorkouts] = useState([]);
  const [muscleFilter, setMuscleFilter] = useState('all');
  const [loadingCatalog, setLoadingCatalog] = useState(false);

  // Load schedule for all users
  useEffect(() => {
    Promise.all([
      apiFetch('/api/workouts/schedule/today').catch(() => []),
      apiFetch('/api/workouts/schedule/week').catch(() => []),
    ]).then(([today, week]) => {
      setTodaySchedule(today);
      setWeekSchedule(week);
    }).finally(() => setLoadingSchedule(false));
  }, []);

  // Load catalog only for admin
  useEffect(() => {
    if (!isAdmin) return;
    setLoadingCatalog(true);
    const params = muscleFilter !== 'all' ? `?muscle_group=${muscleFilter}` : '';
    apiFetch(`/api/workouts${params}`)
      .then(setWorkouts)
      .catch(() => { toast.error(TOASTS.error_workouts); setWorkouts([]); })
      .finally(() => setLoadingCatalog(false));
  }, [isAdmin, muscleFilter]);

  const handleComplete = async (scheduleId) => {
    setCompleting(scheduleId);
    try {
      await apiFetch(`/api/workouts/schedule/${scheduleId}/complete`, { method: 'PUT' });
      toast.success(TOASTS.workout_completed);
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

  // Group workouts by muscle_group for admin catalog
  const groupedWorkouts = {};
  workouts.forEach(w => {
    const group = w.muscle_group || 'otros';
    if (!groupedWorkouts[group]) groupedWorkouts[group] = [];
    groupedWorkouts[group].push(w);
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Entrenamientos</h1>

      {/* ─── TODAY'S WORKOUT ─────────────────────────────────── */}
      {loadingSchedule ? (
        <div className="text-gray-400 text-center py-8">Cargando tu entrenamiento...</div>
      ) : todaySchedule.length > 0 ? (
        <div className="mb-6">
          <h2 className="text-sm uppercase tracking-wider text-gray-500 mb-3">
            Entrenamiento de hoy
          </h2>
          <div className="space-y-3">
            {todaySchedule.map(s => (
              <div key={s.id} className={`card border-l-4 ${s.completed ? 'border-l-green-500 opacity-75' : 'border-l-primary'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-lg">{s.workouts?.title || 'Entrenamiento'}</h3>
                    <p className="text-sm text-gray-400 mt-1">{s.workouts?.description || ''}</p>
                    <div className="flex gap-3 mt-2 text-sm text-gray-400">
                      {s.workouts?.duration_minutes && <span>{s.workouts.duration_minutes} min</span>}
                      {s.workouts?.difficulty && (
                        <span className={DIFFICULTY_COLORS[s.workouts.difficulty]}>
                          {DIFFICULTY_LABELS[s.workouts.difficulty]}
                        </span>
                      )}
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
                          Ver ejercicios
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
      ) : (
        <div className="card mb-6 text-center py-8">
          <div className="text-4xl mb-3">🏖️</div>
          <h3 className="font-bold text-lg mb-1">Día de descanso</h3>
          <p className="text-gray-400 text-sm">No tienes entrenamiento asignado para hoy. Aprovecha para recuperarte.</p>
        </div>
      )}

      {/* ─── WEEKLY CALENDAR ─────────────────────────────────── */}
      <div className="mb-8">
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

      {/* ─── ADMIN: CATALOG BY MUSCLE GROUP ──────────────────── */}
      {isAdmin && (
        <>
          <div className="border-t border-dark-500 pt-6 mt-2">
            <h2 className="text-lg font-bold mb-4">Catálogo de Entrenamientos</h2>

            {/* Muscle group filter */}
            <div className="flex gap-2 mb-6 flex-wrap">
              {MUSCLE_GROUPS.map(mg => (
                <button
                  key={mg.key}
                  onClick={() => { setMuscleFilter(mg.key); }}
                  className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                    muscleFilter === mg.key
                      ? 'bg-primary text-black font-bold'
                      : 'bg-dark-600 text-gray-300 hover:bg-dark-500'
                  }`}
                >
                  {mg.icon ? `${mg.icon} ` : ''}{mg.label}
                </button>
              ))}
            </div>

            {loadingCatalog ? (
              <div className="text-gray-400 text-center py-8">Cargando catálogo...</div>
            ) : workouts.length === 0 ? (
              <div className="text-gray-400 text-center py-8">No hay entrenamientos en esta categoría</div>
            ) : muscleFilter === 'all' ? (
              // Grouped view when "Todos" is selected
              Object.entries(groupedWorkouts).map(([group, items]) => {
                const mgInfo = MUSCLE_GROUPS.find(mg => mg.key === group);
                return (
                  <div key={group} className="mb-6">
                    <h3 className="text-sm uppercase tracking-wider text-primary mb-3">
                      {mgInfo ? `${mgInfo.icon} ${mgInfo.label}` : group}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {items.map(w => (
                        <Link key={w.id} href={`/workouts/${w.id}`}>
                          <div className="card hover:border-primary transition-colors cursor-pointer">
                            <h4 className="font-bold mb-1">{w.title}</h4>
                            <p className="text-xs text-gray-400 mb-2 line-clamp-2">{w.description}</p>
                            <div className="flex items-center justify-between text-xs">
                              <span className={DIFFICULTY_COLORS[w.difficulty]}>
                                {DIFFICULTY_LABELS[w.difficulty]}
                              </span>
                              <span className="text-gray-500">{w.duration_minutes} min</span>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              })
            ) : (
              // Flat view when a specific muscle group is selected
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {workouts.map(w => (
                  <Link key={w.id} href={`/workouts/${w.id}`}>
                    <div className="card hover:border-primary transition-colors cursor-pointer">
                      <h4 className="font-bold mb-1">{w.title}</h4>
                      <p className="text-xs text-gray-400 mb-2 line-clamp-2">{w.description}</p>
                      <div className="flex items-center justify-between text-xs">
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
        </>
      )}
    </div>
  );
}

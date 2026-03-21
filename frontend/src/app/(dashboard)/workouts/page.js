'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { TOASTS } from '@/config/coach-voice';
import Link from 'next/link';

const DIFFICULTY_COLORS = { beginner: 'text-green-400', intermediate: 'text-yellow-400', advanced: 'text-red-400' };
const DIFFICULTY_LABELS = { beginner: 'Principiante', intermediate: 'Intermedio', advanced: 'Avanzado' };
const DAY_NAMES = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'];

export default function WorkoutsPage() {
  const toast = useToast();
  const [todaySchedule, setTodaySchedule] = useState([]);
  const [weekSchedule, setWeekSchedule] = useState([]);
  const [completing, setCompleting] = useState(null);
  const [loadingSchedule, setLoadingSchedule] = useState(true);

  useEffect(() => {
    Promise.all([
      apiFetch('/api/workouts/schedule/today').catch(() => []),
      apiFetch('/api/workouts/schedule/week').catch(() => []),
    ]).then(([today, week]) => {
      setTodaySchedule(today);
      setWeekSchedule(week);
    }).finally(() => setLoadingSchedule(false));
  }, []);

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

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Entrenamientos</h1>

      {/* TODAY'S WORKOUT */}
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
          <svg className="w-10 h-10 text-primary mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
          <h3 className="font-bold text-lg mb-1">Dia de descanso</h3>
          <p className="text-gray-400 text-sm">No tienes entrenamiento asignado para hoy. Aprovecha para recuperarte.</p>
        </div>
      )}

      {/* WEEKLY CALENDAR */}
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
                    {s.completed ? <svg className="w-2.5 h-2.5 inline mr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg> : ''} {s.workouts?.title?.split(' ')[0] || '-'}
                  </div>
                ))
              ) : (
                <div className="text-[8px] text-gray-600 mt-0.5">Descanso</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

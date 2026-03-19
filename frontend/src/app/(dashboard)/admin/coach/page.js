'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { TOASTS } from '@/config/coach-voice';
import Link from 'next/link';

const GOAL_BADGES = {
  lose_weight: { label: 'Perder grasa', color: 'bg-orange-400/10 text-orange-400' },
  gain_muscle: { label: 'Ganar músculo', color: 'bg-primary/10 text-primary' },
  get_shredded: { label: 'Definición', color: 'bg-red-400/10 text-red-400' },
};

const GOAL_FILTERS = [
  { value: 'all', label: 'Todos' },
  { value: 'lose_weight', label: 'Perder' },
  { value: 'gain_muscle', label: 'Ganar' },
  { value: 'get_shredded', label: 'Definir' },
];

export default function CoachDashboardPage() {
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [goalFilter, setGoalFilter] = useState('all');

  useEffect(() => {
    apiFetch('/api/coach/users')
      .then(setUsers)
      .catch(() => toast.error(TOASTS.error_coach_users))
      .finally(() => setLoading(false));
  }, []);

  const filtered = users.filter(u => {
    if (goalFilter !== 'all' && u.goal !== goalFilter) return false;
    if (search && !u.full_name?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const onboardedCount = users.filter(u => u.onboarding_completed).length;
  const activeWeek = users.filter(u => {
    if (!u.last_active_at) return false;
    return (Date.now() - new Date(u.last_active_at)) < 7 * 24 * 60 * 60 * 1000;
  }).length;
  const avgWorkouts = users.length > 0
    ? Math.round(users.reduce((s, u) => s + u.total_workouts, 0) / users.length)
    : 0;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Asesorados</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="card text-center py-4">
          <div className="text-2xl font-bold text-primary">{users.length}</div>
          <div className="text-xs text-gray-400">Total usuarios</div>
        </div>
        <div className="card text-center py-4">
          <div className="text-2xl font-bold text-green-400">{activeWeek}</div>
          <div className="text-xs text-gray-400">Activos esta semana</div>
        </div>
        <div className="card text-center py-4">
          <div className="text-2xl font-bold text-cyan-400">{onboardedCount}</div>
          <div className="text-xs text-gray-400">Onboarding completo</div>
        </div>
        <div className="card text-center py-4">
          <div className="text-2xl font-bold text-yellow-400">{avgWorkouts}</div>
          <div className="text-xs text-gray-400">Promedio entrenamientos</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre..."
          className="input-field flex-1"
        />
        <div className="flex gap-2">
          {GOAL_FILTERS.map(f => (
            <button key={f.value} onClick={() => setGoalFilter(f.value)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
                goalFilter === f.value ? 'bg-primary text-black' : 'bg-dark-600 text-gray-300 hover:bg-dark-500'
              }`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Users list */}
      {loading ? (
        <div className="text-gray-400 text-center py-12">Cargando asesorados...</div>
      ) : filtered.length === 0 ? (
        <div className="text-gray-400 text-center py-12">
          {search || goalFilter !== 'all' ? 'No hay usuarios con ese filtro' : 'Aún no hay asesorados registrados'}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(u => (
            <UserRow key={u.id} user={u} />
          ))}
        </div>
      )}
    </div>
  );
}

function UserRow({ user }) {
  const goal = GOAL_BADGES[user.goal];
  const hasMetabolic = !!user.metabolic;
  const isRecent = user.last_active_at && (Date.now() - new Date(user.last_active_at)) < 7 * 24 * 60 * 60 * 1000;

  return (
    <Link href={`/admin/coach/${user.id}`}>
      <div className="card hover:border-primary/30 transition-colors cursor-pointer p-4">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
            isRecent ? 'bg-primary/20 border border-primary/40 text-primary' : 'bg-dark-600 text-gray-400'
          }`}>
            {(user.full_name || '?').charAt(0).toUpperCase()}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-medium text-sm truncate">{user.full_name || 'Sin nombre'}</p>
              {!user.onboarding_completed && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-yellow-400/10 text-yellow-400">Pendiente</span>
              )}
            </div>
            <div className="flex items-center gap-3 mt-0.5">
              {goal && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${goal.color}`}>{goal.label}</span>
              )}
              {user.weight_kg && (
                <span className="text-xs text-gray-500">{user.weight_kg}kg → {user.target_weight_kg || '?'}kg</span>
              )}
            </div>
          </div>

          {/* Metabolic summary */}
          <div className="hidden sm:flex gap-4 text-xs text-gray-400">
            {hasMetabolic && (
              <>
                <div className="text-center">
                  <div className="font-bold text-primary">{Math.round(user.metabolic.avg_tdee)}</div>
                  <div>TDEE</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-yellow-400">{user.metabolic.avg_body_fat_pct?.toFixed(1)}%</div>
                  <div>Grasa</div>
                </div>
              </>
            )}
            <div className="text-center">
              <div className="font-bold text-white">{user.total_workouts}</div>
              <div>Entrenos</div>
            </div>
          </div>

          {/* Arrow */}
          <svg className="w-4 h-4 text-gray-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  );
}

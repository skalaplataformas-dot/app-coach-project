'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { TOASTS } from '@/config/coach-voice';
import Link from 'next/link';

const GOAL_BADGES = {
  lose_weight: { label: 'Perder grasa', color: 'bg-orange-400/10 text-orange-400' },
  gain_muscle: { label: 'Ganar musculo', color: 'bg-primary/10 text-primary' },
  get_shredded: { label: 'Definicion', color: 'bg-red-400/10 text-red-400' },
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
  const [unassigned, setUnassigned] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [goalFilter, setGoalFilter] = useState('all');
  const [assigning, setAssigning] = useState(null);
  const [showUnassigned, setShowUnassigned] = useState(false);

  const loadData = () => {
    setLoading(true);
    Promise.all([
      apiFetch('/api/coach/users').catch(() => []),
      apiFetch('/api/coach/unassigned').catch(() => []),
    ]).then(([u, ua]) => {
      setUsers(u || []);
      setUnassigned(ua || []);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, []);

  const handleAssign = async (userId) => {
    setAssigning(userId);
    try {
      await apiFetch('/api/coach/assign', { method: 'POST', body: { user_ids: [userId] } });
      toast.success('Asesorado asignado correctamente');
      loadData();
    } catch {
      toast.error('Error al asignar asesorado');
    } finally {
      setAssigning(null);
    }
  };

  const handleAssignAll = async () => {
    if (unassigned.length === 0) return;
    setAssigning('all');
    try {
      await apiFetch('/api/coach/assign', { method: 'POST', body: { user_ids: unassigned.map(u => u.id) } });
      toast.success(`${unassigned.length} asesorados asignados`);
      loadData();
    } catch {
      toast.error('Error al asignar');
    } finally {
      setAssigning(null);
    }
  };

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
    ? Math.round(users.reduce((s, u) => s + (u.total_workouts || 0), 0) / users.length)
    : 0;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Asesorados</h1>

      {/* Unassigned users alert */}
      {unassigned.length > 0 && (
        <div className="card mb-4 border border-yellow-400/20 bg-yellow-400/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-yellow-400/10 flex items-center justify-center">
                <svg className="w-4 h-4 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <div>
                <p className="font-bold text-sm text-yellow-400">{unassigned.length} usuario{unassigned.length > 1 ? 's' : ''} sin asignar</p>
                <p className="text-xs text-gray-400">Nuevos registros pendientes de asignacion</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowUnassigned(!showUnassigned)}
                className="text-xs text-yellow-400 hover:underline"
              >
                {showUnassigned ? 'Ocultar' : 'Ver lista'}
              </button>
              <button
                onClick={handleAssignAll}
                disabled={assigning === 'all'}
                className="text-xs bg-yellow-400/10 text-yellow-400 px-3 py-1.5 rounded-lg hover:bg-yellow-400/20 transition-colors disabled:opacity-50"
              >
                {assigning === 'all' ? 'Asignando...' : 'Asignar todos'}
              </button>
            </div>
          </div>

          {showUnassigned && (
            <div className="mt-3 pt-3 border-t border-yellow-400/10 space-y-2">
              {unassigned.map(u => (
                <div key={u.id} className="flex items-center justify-between bg-dark-700/50 rounded-lg p-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-dark-600 flex items-center justify-center text-xs font-bold text-gray-400">
                      {(u.full_name || '?').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{u.full_name || 'Sin nombre'}</p>
                      <p className="text-[10px] text-gray-500">
                        Registrado {new Date(u.created_at).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}
                        {u.goal && ` | ${GOAL_BADGES[u.goal]?.label || u.goal}`}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleAssign(u.id)}
                    disabled={assigning === u.id}
                    className="text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-lg hover:bg-primary/20 transition-colors disabled:opacity-50"
                  >
                    {assigning === u.id ? 'Asignando...' : 'Asignar'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="card text-center py-4">
          <div className="text-2xl font-bold text-primary">{users.length}</div>
          <div className="text-xs text-gray-400">Mis asesorados</div>
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
          <div className="text-xs text-gray-400">Promedio entrenos</div>
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
          {search || goalFilter !== 'all'
            ? 'No hay usuarios con ese filtro'
            : unassigned.length > 0
              ? 'Asigna los usuarios pendientes para verlos aqui'
              : 'Aun no hay asesorados registrados'}
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
              <div className="font-bold text-white">{user.total_workouts || 0}</div>
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

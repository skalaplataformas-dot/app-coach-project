'use client';

import { useEffect, useState, useCallback } from 'react';
import { apiFetch } from '@/lib/api';
import { useToast } from '@/context/ToastContext';

export default function AdminSystemPage() {
  const toast = useToast();

  // ── State ──────────────────────────────────────────────────────────────
  const [health, setHealth] = useState(null);
  const [loadingHealth, setLoadingHealth] = useState(true);

  const [months, setMonths] = useState(6);
  const [inactiveUsers, setInactiveUsers] = useState(null);
  const [loadingInactive, setLoadingInactive] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [actionLoading, setActionLoading] = useState(null); // 'deactivate' | 'delete' | 'orphaned' | 'calculations'

  const [cleanupResults, setCleanupResults] = useState({
    orphaned: null,
    calculations: null,
  });

  // ── Load system health ─────────────────────────────────────────────────
  const loadHealth = useCallback(async () => {
    setLoadingHealth(true);
    try {
      const data = await apiFetch('/api/admin/system-health');
      setHealth(data);
    } catch (e) {
      toast.error('Error al cargar salud del sistema: ' + e.message);
    } finally {
      setLoadingHealth(false);
    }
  }, []);

  useEffect(() => {
    loadHealth();
  }, [loadHealth]);

  // ── Search inactive users ──────────────────────────────────────────────
  const searchInactive = async () => {
    setLoadingInactive(true);
    setSelectedUsers([]);
    try {
      const data = await apiFetch(`/api/admin/inactive-users?months=${months}`);
      setInactiveUsers(data);
    } catch (e) {
      toast.error('Error al buscar usuarios inactivos: ' + e.message);
    } finally {
      setLoadingInactive(false);
    }
  };

  // ── Select / deselect users ────────────────────────────────────────────
  const toggleUser = (id) => {
    setSelectedUsers((prev) =>
      prev.includes(id) ? prev.filter((uid) => uid !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (!inactiveUsers?.users?.length) return;
    const allIds = inactiveUsers.users.map((u) => u.id);
    setSelectedUsers((prev) =>
      prev.length === allIds.length ? [] : allIds
    );
  };

  // ── Deactivate users ──────────────────────────────────────────────────
  const deactivateSelected = async () => {
    if (selectedUsers.length === 0) return;
    const ok = confirm(
      `Vas a DESACTIVAR ${selectedUsers.length} usuario(s). Sus datos se conservarán pero no podrán iniciar sesión. ¿Continuar?`
    );
    if (!ok) return;

    setActionLoading('deactivate');
    try {
      const result = await apiFetch('/api/admin/deactivate-users', {
        method: 'POST',
        body: { user_ids: selectedUsers },
      });
      toast.success(`${result.deactivated || selectedUsers.length} usuario(s) desactivados`);
      setSelectedUsers([]);
      searchInactive();
      loadHealth();
    } catch (e) {
      toast.error('Error al desactivar: ' + e.message);
    } finally {
      setActionLoading(null);
    }
  };

  // ── Permanently delete users ───────────────────────────────────────────
  const deleteSelected = async () => {
    if (selectedUsers.length === 0) return;
    const ok = confirm(
      `ATENCIÓN: Vas a ELIMINAR PERMANENTEMENTE ${selectedUsers.length} usuario(s) y TODOS sus datos. Esta acción NO se puede deshacer. ¿Continuar?`
    );
    if (!ok) return;

    const ok2 = confirm(
      'Segunda confirmación: Escribe "si" mentalmente. ¿Estás absolutamente seguro?'
    );
    if (!ok2) return;

    setActionLoading('delete');
    try {
      const result = await apiFetch('/api/admin/delete-users', {
        method: 'DELETE',
        body: { user_ids: selectedUsers, confirm: true },
      });
      toast.success(`${result.deleted || selectedUsers.length} usuario(s) eliminados permanentemente`);
      setSelectedUsers([]);
      searchInactive();
      loadHealth();
    } catch (e) {
      toast.error('Error al eliminar: ' + e.message);
    } finally {
      setActionLoading(null);
    }
  };

  // ── Cleanup actions ────────────────────────────────────────────────────
  const runCleanup = async (type) => {
    const endpoint =
      type === 'orphaned'
        ? '/api/admin/cleanup-orphaned'
        : '/api/admin/cleanup-calculations';

    const label =
      type === 'orphaned' ? 'datos huérfanos' : 'cálculos antiguos';

    const ok = confirm(`Ejecutar limpieza de ${label}?`);
    if (!ok) return;

    setActionLoading(type);
    try {
      const result = await apiFetch(endpoint, { method: 'POST' });
      setCleanupResults((prev) => ({ ...prev, [type]: result }));
      toast.success(`Limpieza de ${label} completada`);
      loadHealth();
    } catch (e) {
      toast.error('Error en limpieza: ' + e.message);
    } finally {
      setActionLoading(null);
    }
  };

  // ── Helpers ────────────────────────────────────────────────────────────
  const storage = health?.storage || {};

  const statCards = [
    { label: 'Total Usuarios', value: (storage.total_users ?? 0) + (storage.deactivated_users ?? 0), icon: 'U', color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { label: 'Usuarios Activos', value: storage.total_users ?? 0, icon: 'A', color: 'text-[#00ff88]', bg: 'bg-[#00ff88]/10' },
    { label: 'Desactivados', value: storage.deactivated_users ?? 0, icon: 'D', color: 'text-red-400', bg: 'bg-red-400/10' },
    { label: 'Alimentos', value: storage.total_foods ?? 0, icon: 'F', color: 'text-cyan-400', bg: 'bg-cyan-400/10' },
    { label: 'Entrenamientos', value: storage.total_workouts ?? 0, icon: 'W', color: 'text-purple-400', bg: 'bg-purple-400/10' },
    { label: 'Logs de Entrenamiento', value: storage.total_workout_logs ?? 0, icon: 'L', color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
  ];

  const formatDate = (iso) => {
    if (!iso) return '-';
    return new Date(iso).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Panel de Sistema</h1>
          <p className="text-sm text-gray-500 mt-1">
            Administración y mantenimiento de la plataforma
          </p>
        </div>
        <button
          onClick={() => { loadHealth(); setInactiveUsers(null); setCleanupResults({ orphaned: null, calculations: null }); }}
          disabled={loadingHealth}
          className="btn-secondary text-sm flex items-center gap-2 disabled:opacity-50"
        >
          <span className={loadingHealth ? 'animate-spin' : ''}>&#8635;</span>
          Actualizar
        </button>
      </div>

      {loadingHealth ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-400">Cargando datos del sistema...</div>
        </div>
      ) : (
        <>
          {/* ── Stats Cards ────────────────────────────────────────── */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
            {statCards.map((card) => (
              <div key={card.label} className="card text-center py-4 animate-slide-up-page">
                <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center mx-auto mb-2`}>
                  <span className={`text-lg font-bold ${card.color}`}>{card.icon}</span>
                </div>
                <div className={`text-2xl font-bold ${card.color}`}>{card.value}</div>
                <div className="text-xs text-gray-400 mt-1">{card.label}</div>
              </div>
            ))}
          </div>

          {/* ── System Health ──────────────────────────────────────── */}
          <div className="card mb-8 animate-slide-up-page">
            <h2 className="text-sm font-bold text-gray-400 uppercase mb-4">Salud del Sistema</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="text-xs text-gray-500 mb-1">Estado</div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#00ff88] animate-pulse" />
                  <span className="text-[#00ff88] font-semibold capitalize">{health?.status || 'unknown'}</span>
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Última verificación</div>
                <div className="text-sm font-medium">{formatDate(health?.timestamp)}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Inactivos ({'>'}6 meses)</div>
                <div className={`text-sm font-medium ${health?.inactive_users_6m > 0 ? 'text-yellow-400' : 'text-[#00ff88]'}`}>
                  {health?.inactive_users_6m ?? 0} usuario(s)
                </div>
              </div>
            </div>

            {health?.recommendations?.length > 0 && (
              <div className="mt-4 pt-4 border-t border-dark-500">
                <div className="text-xs text-gray-500 mb-2">Recomendaciones</div>
                <ul className="space-y-1">
                  {health.recommendations.map((rec, i) => (
                    <li key={i} className="text-sm text-yellow-400 flex items-start gap-2">
                      <span className="mt-0.5">&#9888;</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* ── Inactive Users ─────────────────────────────────────── */}
          <div className="card mb-8 animate-slide-up-page">
            <h2 className="text-sm font-bold text-gray-400 uppercase mb-4">Usuarios Inactivos</h2>

            <div className="flex flex-wrap items-end gap-3 mb-4">
              <div>
                <label className="input-label">Meses de inactividad</label>
                <select
                  value={months}
                  onChange={(e) => setMonths(Number(e.target.value))}
                  className="input-field w-32"
                >
                  <option value={3}>3 meses</option>
                  <option value={6}>6 meses</option>
                  <option value={9}>9 meses</option>
                  <option value={12}>12 meses</option>
                </select>
              </div>
              <button
                onClick={searchInactive}
                disabled={loadingInactive}
                className="btn-primary text-sm disabled:opacity-50"
              >
                {loadingInactive ? 'Buscando...' : 'Buscar inactivos'}
              </button>
            </div>

            {inactiveUsers && (
              <>
                <div className="text-sm text-gray-400 mb-3">
                  {inactiveUsers.count} usuario(s) inactivos por más de {inactiveUsers.threshold_months} meses
                </div>

                {inactiveUsers.users?.length > 0 ? (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-gray-400 border-b border-dark-500">
                            <th className="text-left py-2 pr-2">
                              <input
                                type="checkbox"
                                checked={selectedUsers.length === inactiveUsers.users.length && selectedUsers.length > 0}
                                onChange={toggleAll}
                                className="accent-[#00ff88]"
                              />
                            </th>
                            <th className="text-left py-2">Nombre</th>
                            <th className="text-left py-2">Email</th>
                            <th className="text-left py-2">Última actividad</th>
                          </tr>
                        </thead>
                        <tbody>
                          {inactiveUsers.users.map((u) => (
                            <tr
                              key={u.id}
                              className={`border-b border-dark-600 hover:bg-dark-700 transition-colors ${
                                selectedUsers.includes(u.id) ? 'bg-dark-700' : ''
                              }`}
                            >
                              <td className="py-2 pr-2">
                                <input
                                  type="checkbox"
                                  checked={selectedUsers.includes(u.id)}
                                  onChange={() => toggleUser(u.id)}
                                  className="accent-[#00ff88]"
                                />
                              </td>
                              <td className="py-2 font-medium">{u.full_name || u.display_name || '-'}</td>
                              <td className="py-2 text-gray-400">{u.email || '-'}</td>
                              <td className="py-2 text-gray-400">{formatDate(u.last_sign_in_at || u.updated_at)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-dark-500">
                      <span className="text-xs text-gray-500 self-center">
                        {selectedUsers.length} seleccionado(s)
                      </span>
                      <button
                        onClick={deactivateSelected}
                        disabled={selectedUsers.length === 0 || actionLoading === 'deactivate'}
                        className="btn-secondary text-sm disabled:opacity-50"
                      >
                        {actionLoading === 'deactivate' ? 'Desactivando...' : 'Desactivar seleccionados'}
                      </button>
                      <button
                        onClick={deleteSelected}
                        disabled={selectedUsers.length === 0 || actionLoading === 'delete'}
                        className="bg-red-500/10 text-red-400 border border-red-500/30 px-4 py-2 rounded-xl text-sm hover:bg-red-500/20 transition-colors disabled:opacity-50"
                      >
                        {actionLoading === 'delete' ? 'Eliminando...' : 'Eliminar permanentemente'}
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    No se encontraron usuarios inactivos en este periodo
                  </div>
                )}
              </>
            )}
          </div>

          {/* ── Cleanup Actions ─────────────────────────────────────── */}
          <div className="mb-8 animate-slide-up-page">
            <h2 className="text-sm font-bold text-gray-400 uppercase mb-4">Acciones de Limpieza</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Orphaned data */}
              <div className="card">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-400/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-orange-400 font-bold">&#128465;</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">Limpiar datos huérfanos</h3>
                    <p className="text-xs text-gray-400 mb-3">
                      Elimina registros de nutrición, metabolismo y logs que pertenecen a usuarios eliminados o inexistentes.
                    </p>
                    <button
                      onClick={() => runCleanup('orphaned')}
                      disabled={actionLoading === 'orphaned'}
                      className="btn-secondary text-sm disabled:opacity-50"
                    >
                      {actionLoading === 'orphaned' ? 'Ejecutando...' : 'Ejecutar limpieza'}
                    </button>
                    {cleanupResults.orphaned && (
                      <div className="mt-3 p-3 rounded-lg bg-dark-800 border border-dark-500">
                        <div className="text-xs text-[#00ff88] mb-1">Limpieza completada</div>
                        <pre className="text-xs text-gray-400 whitespace-pre-wrap">
                          {JSON.stringify(cleanupResults.orphaned.report || cleanupResults.orphaned, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Old calculations */}
              <div className="card">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-400/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-purple-400 font-bold">&#128202;</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">Limpiar cálculos antiguos</h3>
                    <p className="text-xs text-gray-400 mb-3">
                      Conserva solo los últimos 10 resultados metabólicos por usuario, eliminando los mas antiguos.
                    </p>
                    <button
                      onClick={() => runCleanup('calculations')}
                      disabled={actionLoading === 'calculations'}
                      className="btn-secondary text-sm disabled:opacity-50"
                    >
                      {actionLoading === 'calculations' ? 'Ejecutando...' : 'Ejecutar limpieza'}
                    </button>
                    {cleanupResults.calculations && (
                      <div className="mt-3 p-3 rounded-lg bg-dark-800 border border-dark-500">
                        <div className="text-xs text-[#00ff88] mb-1">Limpieza completada</div>
                        <pre className="text-xs text-gray-400 whitespace-pre-wrap">
                          {JSON.stringify(cleanupResults.calculations, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

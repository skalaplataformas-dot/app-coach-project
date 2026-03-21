'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { TOASTS } from '@/config/coach-voice';

const GOAL_OPTIONS = [
  { value: 'lose_weight', label: 'Perder grasa' },
  { value: 'gain_muscle', label: 'Ganar músculo' },
  { value: 'get_shredded', label: 'Definición extrema' },
];

const GOAL_COLORS = {
  lose_weight: 'text-orange-400 bg-orange-400/10',
  gain_muscle: 'text-primary bg-primary/10',
  get_shredded: 'text-red-400 bg-red-400/10',
};

const CATEGORY_COLORS = {
  Proteinas: 'text-primary bg-primary/10',
  Carbohidratos: 'text-cyan-400 bg-cyan-400/10',
  Grasas: 'text-yellow-400 bg-yellow-400/10',
  Frutas: 'text-green-400 bg-green-400/10',
  Empacados: 'text-purple-400 bg-purple-400/10',
};

export default function CoachUserDetailPage() {
  const { userId } = useParams();
  const router = useRouter();
  const toast = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [edits, setEdits] = useState({});
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    apiFetch(`/api/coach/users/${userId}`)
      .then(d => { setData(d); setEdits({}); })
      .catch(() => toast.error(TOASTS.error_coach_user))
      .finally(() => setLoading(false));
  }, [userId]);

  const handleEdit = (key, value) => {
    setEdits(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (Object.keys(edits).length === 0) return;
    setSaving(true);
    try {
      await apiFetch(`/api/coach/users/${userId}`, { method: 'PUT', body: edits });
      toast.success(TOASTS.profile_updated);
      const d = await apiFetch(`/api/coach/users/${userId}`);
      setData(d);
      setEdits({});
    } catch {
      toast.error(TOASTS.error_save);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-gray-400 text-center py-12">Cargando...</div>;
  if (!data) return <div className="text-gray-400 text-center py-12">Usuario no encontrado</div>;

  const { profile, metabolic, nutrition, stats, metabolic_history } = data;
  const getValue = (key) => edits[key] !== undefined ? edits[key] : profile[key];
  const hasEdits = Object.keys(edits).length > 0;
  const goalColor = GOAL_COLORS[profile.goal] || '';

  const tabs = [
    { id: 'general', label: 'General' },
    { id: 'calendar', label: 'Calendario' },
    { id: 'nutrition', label: 'Nutrición' },
    { id: 'progress', label: 'Progreso' },
    { id: 'health', label: 'Salud' },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back */}
      <button onClick={() => router.push('/admin/coach')}
        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Volver a asesorados
      </button>

      {/* Header */}
      <div className="card mb-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-primary/20 border-2 border-primary/40 flex items-center justify-center text-primary font-bold text-xl">
            {(profile.full_name || '?').charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold">{profile.full_name || 'Sin nombre'}</h1>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${goalColor}`}>
                {GOAL_OPTIONS.find(g => g.value === profile.goal)?.label || profile.goal || 'Sin objetivo'}
              </span>
              <span className="text-xs text-gray-500">
                {profile.sex === 'M' ? 'Hombre' : profile.sex === 'F' ? 'Mujer' : ''} · {profile.age || '?'} años · {profile.weight_kg || '?'}kg
              </span>
              <span className="text-xs text-gray-500">
                Desde {new Date(profile.created_at).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>
          </div>
          {/* Quick stats */}
          <div className="hidden md:flex gap-3">
            <MiniStat label="Entrenos" value={stats.total_workouts} color="text-primary" />
            <MiniStat label="Racha" value={`${stats.streak}d`} color="text-orange-400" />
            <MiniStat label="Semana" value={stats.week_workouts} color="text-cyan-400" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-dark-800 rounded-xl p-1">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.id ? 'bg-primary/10 text-primary' : 'text-gray-400 hover:text-white'
            }`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'general' && (
        <GeneralTab profile={profile} metabolic={metabolic} stats={stats}
          getValue={getValue} handleEdit={handleEdit} handleSave={handleSave}
          hasEdits={hasEdits} saving={saving} />
      )}
      {activeTab === 'calendar' && (
        <CalendarTab userId={userId} />
      )}
      {activeTab === 'nutrition' && (
        <NutritionTab nutrition={nutrition} />
      )}
      {activeTab === 'progress' && (
        <ProgressTab profile={profile} metabolicHistory={metabolic_history} stats={stats} />
      )}
      {activeTab === 'health' && (
        <HealthTab profile={profile} />
      )}
    </div>
  );
}

// ─── General Tab ────────────────────────────────────────────────────────
function GeneralTab({ profile, metabolic, stats, getValue, handleEdit, handleSave, hasEdits, saving }) {
  return (
    <div className="space-y-4">
      {/* Editable Profile */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Datos del Perfil</h2>
          {hasEdits && (
            <button onClick={handleSave} disabled={saving}
              className="btn-primary px-4 py-1.5 text-sm disabled:opacity-50">
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <EditField label="Peso actual (kg)" type="number" value={getValue('weight_kg')} onChange={v => handleEdit('weight_kg', Number(v))} />
          <EditField label="Peso objetivo (kg)" type="number" value={getValue('target_weight_kg')} onChange={v => handleEdit('target_weight_kg', Number(v))} />
          <EditField label="Altura (cm)" type="number" value={getValue('height_cm')} onChange={v => handleEdit('height_cm', Number(v))} />
          <EditField label="Edad" type="number" value={getValue('age')} onChange={v => handleEdit('age', Number(v))} />
          <div>
            <label className="text-xs text-gray-500 block mb-1">Objetivo</label>
            <select value={getValue('goal') || ''} onChange={e => handleEdit('goal', e.target.value)}
              className="input-field w-full text-sm">
              {GOAL_OPTIONS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
            </select>
          </div>
          <EditField label="Nivel actividad (1-6)" type="number" value={getValue('activity_level')} onChange={v => handleEdit('activity_level', Number(v))} />
          <EditField label="Cuello (cm)" type="number" value={getValue('neck_cm')} onChange={v => handleEdit('neck_cm', Number(v))} />
          <EditField label="Cintura (cm)" type="number" value={getValue('waist_cm')} onChange={v => handleEdit('waist_cm', Number(v))} />
          <EditField label="Cadera (cm)" type="number" value={getValue('hip_cm')} onChange={v => handleEdit('hip_cm', Number(v))} />
        </div>
      </div>

      {/* Metabolic Data */}
      {metabolic && (
        <div className="card">
          <h2 className="text-lg font-bold mb-4">Datos Metabólicos</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <StatBox label="TDEE" value={`${Math.round(metabolic.avg_tdee)} kcal`} color="text-primary" />
            <StatBox label="BMI" value={metabolic.bmi?.toFixed(1)} color="text-white" />
            <StatBox label="% Grasa" value={`${metabolic.avg_body_fat_pct?.toFixed(1)}%`} color="text-yellow-400" />
            <StatBox label="Masa muscular" value={`${metabolic.muscle_mass_kg?.toFixed(1)} kg`} color="text-cyan-400" />
            <StatBox label="Masa grasa" value={`${(metabolic.avg_fat_mass_kg || 0).toFixed(1)} kg`} color="text-orange-400" />
            <StatBox label="RMR" value={`${Math.round(metabolic.avg_rmr || 0)} kcal`} color="text-gray-300" />
          </div>
          <p className="text-xs text-gray-500 mt-3">
            Calculado: {new Date(metabolic.calculated_at).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
        </div>
      )}

      {/* Recent workouts */}
      {stats.recent_workouts?.length > 0 && (
        <div className="card">
          <h2 className="text-lg font-bold mb-3">Últimos Entrenamientos</h2>
          <div className="space-y-1">
            {stats.recent_workouts.map((w, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-dark-600 last:border-0">
                <span className="text-sm text-gray-300">Entrenamiento completado</span>
                <span className="text-xs text-gray-500">
                  {new Date(w.date).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Nutrition Tab ──────────────────────────────────────────────────────
function NutritionTab({ nutrition }) {
  if (!nutrition) return <div className="card text-gray-400 text-center py-8">Sin plan nutricional generado</div>;

  const meals = nutrition.meal_distribution || [];

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="card">
        <h2 className="text-lg font-bold mb-4">Resumen del Plan</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatBox label="Calorías/día" value={nutrition.daily_calories} color="text-primary" />
          <StatBox label="Proteína" value={`${nutrition.protein_g}g`} color="text-green-400" />
          <StatBox label="Carbohidratos" value={`${nutrition.carbs_g}g`} color="text-cyan-400" />
          <StatBox label="Grasas" value={`${nutrition.fat_g}g`} color="text-yellow-400" />
        </div>
        {nutrition.deficit_or_surplus && (
          <div className="flex gap-4 mt-3 text-xs text-gray-400">
            <span>{nutrition.deficit_or_surplus > 0 ? 'Superávit' : 'Déficit'}: {Math.abs(nutrition.deficit_or_surplus)} kcal/día</span>
            {nutrition.timeline_days && <span>{nutrition.timeline_days} días estimados</span>}
          </div>
        )}
      </div>

      {/* Meal distribution with food suggestions */}
      {meals.map((meal, i) => (
        <div key={i} className="card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-sm">{meal.name}</h3>
            <span className="text-xs text-gray-500">{Math.round(meal.calories)} kcal · P{Math.round(meal.protein_g)}g · C{Math.round(meal.carbs_g)}g · G{Math.round(meal.fat_g)}g</span>
          </div>

          {/* Food suggestions */}
          {meal.suggestions?.length > 0 ? (
            <div className="space-y-2">
              {meal.suggestions.map((food, j) => {
                const catColor = CATEGORY_COLORS[food.category] || 'text-gray-400 bg-dark-600';
                return (
                  <div key={j} className="flex items-center justify-between py-1.5 border-b border-dark-700 last:border-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${catColor}`}>
                        {food.category === 'Proteinas' ? 'P' : food.category === 'Carbohidratos' ? 'C' : food.category === 'Grasas' ? 'G' : food.category === 'Frutas' ? 'F' : 'E'}
                      </span>
                      <span className="text-sm">{food.display_amount} de {food.name}</span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {Math.round(food.calories)} kcal
                    </span>
                  </div>
                );
              })}
              {/* Totals vs target */}
              {(() => {
                const totals = meal.suggestions.reduce((acc, f) => ({
                  cal: acc.cal + (f.calories || 0),
                  p: acc.p + (f.protein_g || 0),
                  c: acc.c + (f.carbs_g || 0),
                  g: acc.g + (f.fat_g || 0),
                }), { cal: 0, p: 0, c: 0, g: 0 });
                const match = Math.round(100 - Math.abs(totals.cal - meal.calories) / meal.calories * 100);
                return (
                  <div className="flex items-center justify-between pt-2 mt-1 border-t border-dark-600">
                    <span className="text-xs text-gray-500">
                      Total: {Math.round(totals.cal)} kcal · P{Math.round(totals.p)}g · C{Math.round(totals.c)}g · G{Math.round(totals.g)}g
                    </span>
                    <span className={`text-xs font-bold ${match >= 95 ? 'text-green-400' : match >= 85 ? 'text-yellow-400' : 'text-orange-400'}`}>
                      {match}% match
                    </span>
                  </div>
                );
              })()}
            </div>
          ) : (
            <p className="text-xs text-gray-500">Sin sugerencias de alimentos</p>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Progress Tab ───────────────────────────────────────────────────────
function ProgressTab({ profile, metabolicHistory, stats }) {
  const hasHistory = metabolicHistory && metabolicHistory.length > 0;
  const weightDiff = profile.weight_kg && profile.target_weight_kg
    ? (profile.weight_kg - profile.target_weight_kg).toFixed(1)
    : null;

  return (
    <div className="space-y-4">
      {/* Weight Progress */}
      <div className="card">
        <h2 className="text-lg font-bold mb-4">Progreso de Peso</h2>
        <div className="grid grid-cols-3 gap-3 mb-4">
          <StatBox label="Peso actual" value={`${profile.weight_kg || '?'} kg`} color="text-white" />
          <StatBox label="Peso objetivo" value={`${profile.target_weight_kg || '?'} kg`} color="text-primary" />
          <StatBox label="Diferencia" value={weightDiff ? `${weightDiff > 0 ? '-' : '+'}${Math.abs(weightDiff)} kg` : '?'}
            color={weightDiff > 0 ? 'text-orange-400' : 'text-green-400'} />
        </div>
        {weightDiff && (
          <div className="relative h-3 bg-dark-600 rounded-full overflow-hidden">
            <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-cyan-400 rounded-full transition-all"
              style={{ width: `${Math.min(100, Math.max(5, 100 - Math.abs(Number(weightDiff)) / (profile.weight_kg || 1) * 100))}%` }} />
          </div>
        )}
      </div>

      {/* Metabolic History */}
      {hasHistory && (
        <div className="card">
          <h2 className="text-lg font-bold mb-4">Historial Metabólico</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 text-xs border-b border-dark-600">
                  <th className="text-left py-2 font-medium">Fecha</th>
                  <th className="text-center py-2 font-medium">TDEE</th>
                  <th className="text-center py-2 font-medium">% Grasa</th>
                  <th className="text-center py-2 font-medium">M. Muscular</th>
                  <th className="text-center py-2 font-medium">BMI</th>
                </tr>
              </thead>
              <tbody>
                {metabolicHistory.slice().reverse().map((m, i) => (
                  <tr key={i} className="border-b border-dark-700 last:border-0">
                    <td className="py-2 text-gray-300">
                      {new Date(m.calculated_at).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}
                    </td>
                    <td className="py-2 text-center text-primary font-medium">{Math.round(m.avg_tdee)}</td>
                    <td className="py-2 text-center text-yellow-400">{m.avg_body_fat_pct?.toFixed(1)}%</td>
                    <td className="py-2 text-center text-cyan-400">{m.muscle_mass_kg?.toFixed(1)} kg</td>
                    <td className="py-2 text-center text-gray-300">{m.bmi?.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Workout Activity */}
      <div className="card">
        <h2 className="text-lg font-bold mb-4">Actividad de Entrenamientos</h2>
        <div className="grid grid-cols-3 gap-3 mb-4">
          <StatBox label="Total" value={stats.total_workouts} color="text-primary" />
          <StatBox label="Racha" value={`${stats.streak} días`} color="text-orange-400" />
          <StatBox label="Esta semana" value={stats.week_workouts} color="text-cyan-400" />
        </div>
        {stats.recent_workouts?.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs text-gray-500 mb-2">Últimas sesiones:</p>
            {stats.recent_workouts.map((w, i) => (
              <div key={i} className="flex items-center justify-between py-1.5 text-sm border-b border-dark-700 last:border-0">
                <span className="text-gray-300">Sesión completada</span>
                <span className="text-xs text-gray-500">
                  {new Date(w.date).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Health Tab ──────────────────────────────────────────────────────────
function HealthTab({ profile }) {
  const hasHealth = profile.medical_conditions || profile.injuries || profile.allergies || profile.medications;
  const hasHabits = profile.sleep_hours || profile.water_liters || profile.stress_level;

  return (
    <div className="space-y-4">
      {/* Habits */}
      {hasHabits && (
        <div className="card">
          <h2 className="text-lg font-bold mb-4">Hábitos</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {profile.sleep_hours && <StatBox label="Sueño" value={`${profile.sleep_hours}h`} color="text-indigo-400" />}
            {profile.water_liters && <StatBox label="Agua" value={`${profile.water_liters}L`} color="text-cyan-400" />}
            {profile.stress_level && <StatBox label="Estrés" value={`${profile.stress_level}/5`} color="text-red-400" />}
            {profile.alcohol_frequency && (
              <StatBox label="Alcohol" value={
                profile.alcohol_frequency === 'never' ? 'Nunca' :
                profile.alcohol_frequency === 'occasional' ? 'Ocasional' :
                profile.alcohol_frequency === 'moderate' ? 'Moderado' : 'Frecuente'
              } color="text-yellow-400" />
            )}
          </div>
        </div>
      )}

      {/* Medical Info */}
      {hasHealth && (
        <div className="card">
          <h2 className="text-lg font-bold mb-4">Información Médica</h2>
          <div className="space-y-3">
            {profile.medical_conditions && <HealthField label="Condiciones médicas" value={profile.medical_conditions} icon="🏥" />}
            {profile.injuries && <HealthField label="Lesiones" value={profile.injuries} icon="🩹" />}
            {profile.medications && <HealthField label="Medicamentos" value={profile.medications} icon="💊" />}
            {profile.allergies && <HealthField label="Alergias" value={profile.allergies} icon="⚠️" />}
          </div>
        </div>
      )}

      {/* Preferred Foods */}
      {profile.preferred_foods && (
        <div className="card">
          <h2 className="text-lg font-bold mb-4">Alimentos Preferidos</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {Object.entries(profile.preferred_foods).map(([category, foods]) => (
              <div key={category} className="bg-dark-700/50 rounded-xl p-3">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">{category}</p>
                <div className="space-y-1">
                  {(foods || []).map((food, i) => (
                    <p key={i} className="text-sm text-gray-300">{food}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!hasHealth && !hasHabits && !profile.preferred_foods && (
        <div className="card text-gray-400 text-center py-8">
          Sin información de salud registrada
        </div>
      )}
    </div>
  );
}

// ─── Shared components ──────────────────────────────────────────────────
function EditField({ label, type, value, onChange }) {
  return (
    <div>
      <label className="text-xs text-gray-500 block mb-1">{label}</label>
      <input type={type} value={value || ''} onChange={e => onChange(e.target.value)}
        className="input-field w-full text-sm" step={type === 'number' ? '0.1' : undefined} />
    </div>
  );
}

function StatBox({ label, value, color }) {
  return (
    <div className="bg-dark-700/50 rounded-xl p-3 text-center">
      <div className={`text-lg font-bold ${color}`}>{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-gray-500">{label}</div>
    </div>
  );
}

function MiniStat({ label, value, color }) {
  return (
    <div className="text-center px-3">
      <div className={`text-sm font-bold ${color}`}>{value}</div>
      <div className="text-[9px] text-gray-500">{label}</div>
    </div>
  );
}

// ─── Calendar Tab (Coach assigns workouts) ──────────────────────────────
function CalendarTab({ userId }) {
  const toast = useToast();
  const [schedule, setSchedule] = useState([]);
  const [allWorkouts, setAllWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [weekOffset, setWeekOffset] = useState(0);
  const [assigning, setAssigning] = useState(null); // dateStr being assigned
  const [selectedWorkout, setSelectedWorkout] = useState('');

  const getWeekDates = (offset) => {
    const today = new Date();
    const base = new Date(today);
    base.setDate(today.getDate() + offset * 7);
    const day = base.getDay();
    const monday = new Date(base);
    monday.setDate(base.getDate() - (day === 0 ? 6 : day - 1));
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d;
    });
  };

  const weekDays = getWeekDates(weekOffset);
  const startDate = weekDays[0].toISOString().split('T')[0];
  const todayStr = new Date().toISOString().split('T')[0];
  const DAY_NAMES = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  useEffect(() => {
    setLoading(true);
    Promise.all([
      apiFetch(`/api/coach/users/${userId}/schedule?date=${startDate}`),
      allWorkouts.length === 0 ? apiFetch('/api/workouts') : Promise.resolve(allWorkouts),
    ]).then(([sched, wk]) => {
      setSchedule(sched);
      if (wk !== allWorkouts) setAllWorkouts(wk);
    }).catch(() => toast.error('Error al cargar calendario'))
      .finally(() => setLoading(false));
  }, [userId, weekOffset]);

  const handleAssign = async (dateStr) => {
    if (!selectedWorkout) return;
    try {
      await apiFetch(`/api/coach/users/${userId}/schedule`, {
        method: 'POST',
        body: { workout_id: selectedWorkout, scheduled_date: dateStr },
      });
      toast.success('Entrenamiento asignado');
      setAssigning(null);
      setSelectedWorkout('');
      // Refresh
      const sched = await apiFetch(`/api/coach/users/${userId}/schedule?date=${startDate}`);
      setSchedule(sched);
    } catch (err) {
      toast.error(err.message || 'Error al asignar');
    }
  };

  const handleRemove = async (scheduleId) => {
    try {
      await apiFetch(`/api/coach/users/${userId}/schedule/${scheduleId}`, { method: 'DELETE' });
      setSchedule(prev => prev.filter(s => s.id !== scheduleId));
      toast.success('Entrenamiento removido');
    } catch {
      toast.error('Error al eliminar');
    }
  };

  if (loading) return <div className="text-gray-400 text-center py-8">Cargando calendario...</div>;

  // Calculate compliance
  const pastDays = weekDays.filter(d => d.toISOString().split('T')[0] <= todayStr);
  const scheduledPast = schedule.filter(s => s.scheduled_date <= todayStr);
  const completedPast = scheduledPast.filter(s => s.completed);
  const compliance = scheduledPast.length > 0 ? Math.round(completedPast.length / scheduledPast.length * 100) : null;

  return (
    <div className="space-y-4">
      {/* Week navigation + compliance */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setWeekOffset(w => w - 1)} className="text-gray-400 hover:text-white p-1">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <div className="text-center">
            <span className="font-bold text-sm">
              {weekDays[0].toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })} — {weekDays[6].toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}
            </span>
            {weekOffset !== 0 && (
              <button onClick={() => setWeekOffset(0)} className="ml-2 text-xs text-primary hover:underline">Hoy</button>
            )}
          </div>
          <button onClick={() => setWeekOffset(w => w + 1)} className="text-gray-400 hover:text-white p-1">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>

        {compliance !== null && (
          <div className="flex items-center gap-3 mb-4 p-3 bg-dark-700/50 rounded-xl">
            <div className={`text-2xl font-bold ${compliance >= 80 ? 'text-green-400' : compliance >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
              {compliance}%
            </div>
            <div className="text-xs text-gray-400">
              Cumplimiento: {completedPast.length}/{scheduledPast.length} entrenamientos completados
            </div>
          </div>
        )}

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day, i) => {
            const dateStr = day.toISOString().split('T')[0];
            const daySchedule = schedule.filter(s => s.scheduled_date === dateStr);
            const isToday = dateStr === todayStr;
            const isPast = dateStr < todayStr;

            return (
              <div key={dateStr} className={`rounded-xl p-2 min-h-[100px] ${
                isToday ? 'bg-primary/10 border border-primary/30' : 'bg-dark-700/50'
              }`}>
                <div className={`text-[10px] uppercase text-center ${isToday ? 'text-primary font-bold' : 'text-gray-500'}`}>
                  {DAY_NAMES[i]}
                </div>
                <div className={`text-sm font-bold text-center mb-2 ${isToday ? 'text-white' : 'text-gray-300'}`}>
                  {day.getDate()}
                </div>

                {daySchedule.map(s => (
                  <div key={s.id} className={`text-[9px] rounded px-1 py-1 mb-1 flex items-center justify-between ${
                    s.completed ? 'bg-green-500/20 text-green-400' : isPast ? 'bg-red-500/10 text-red-400' : 'bg-primary/10 text-primary'
                  }`}>
                    <span className="truncate">{s.completed ? '✓ ' : ''}{s.workouts?.title?.split('-')[0]?.trim() || 'Entreno'}</span>
                    <button onClick={() => handleRemove(s.id)} className="ml-1 text-gray-500 hover:text-red-400 flex-shrink-0">×</button>
                  </div>
                ))}

                {/* Add button */}
                {assigning === dateStr ? (
                  <div className="mt-1">
                    <select value={selectedWorkout} onChange={e => setSelectedWorkout(e.target.value)}
                      className="w-full text-[9px] bg-dark-600 text-white rounded p-1 mb-1">
                      <option value="">Seleccionar...</option>
                      {allWorkouts.map(w => <option key={w.id} value={w.id}>{w.title}</option>)}
                    </select>
                    <div className="flex gap-1">
                      <button onClick={() => handleAssign(dateStr)} className="text-[8px] bg-primary/20 text-primary rounded px-1 py-0.5 flex-1">✓</button>
                      <button onClick={() => { setAssigning(null); setSelectedWorkout(''); }} className="text-[8px] bg-dark-600 text-gray-400 rounded px-1 py-0.5">✕</button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setAssigning(dateStr)}
                    className="w-full text-[9px] text-gray-600 hover:text-primary mt-1 border border-dashed border-dark-500 rounded py-0.5">
                    + Asignar
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function HealthField({ label, value, icon }) {
  return (
    <div className="flex items-start gap-2 bg-dark-700/30 rounded-xl p-3">
      <span className="text-sm">{icon}</span>
      <div>
        <span className="text-xs text-gray-500 block">{label}</span>
        <p className="text-sm text-gray-300">{value}</p>
      </div>
    </div>
  );
}

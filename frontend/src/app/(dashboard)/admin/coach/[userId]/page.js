'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { useToast } from '@/context/ToastContext';

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

export default function CoachUserDetailPage() {
  const { userId } = useParams();
  const router = useRouter();
  const toast = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [edits, setEdits] = useState({});

  useEffect(() => {
    apiFetch(`/api/coach/users/${userId}`)
      .then(d => { setData(d); setEdits({}); })
      .catch(() => toast.error('Error al cargar usuario'))
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
      toast.success('Perfil actualizado');
      // Refresh data
      const d = await apiFetch(`/api/coach/users/${userId}`);
      setData(d);
      setEdits({});
    } catch {
      toast.error('Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-gray-400 text-center py-12">Cargando...</div>;
  if (!data) return <div className="text-gray-400 text-center py-12">Usuario no encontrado</div>;

  const { profile, metabolic, nutrition, stats } = data;
  const getValue = (key) => edits[key] !== undefined ? edits[key] : profile[key];
  const hasEdits = Object.keys(edits).length > 0;
  const goalColor = GOAL_COLORS[profile.goal] || '';

  return (
    <div className="max-w-3xl mx-auto">
      {/* Back */}
      <button onClick={() => router.push('/admin/coach')}
        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Volver a asesorados
      </button>

      {/* Header */}
      <div className="card mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-primary/20 border-2 border-primary/40 flex items-center justify-center text-primary font-bold text-xl">
            {(profile.full_name || '?').charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-bold">{profile.full_name || 'Sin nombre'}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${goalColor}`}>
                {GOAL_OPTIONS.find(g => g.value === profile.goal)?.label || profile.goal}
              </span>
              <span className="text-xs text-gray-500">
                Registrado: {new Date(profile.created_at).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Editable Profile */}
      <div className="card mb-4">
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

      {/* Metabolic Data (read-only) */}
      {metabolic && (
        <div className="card mb-4">
          <h2 className="text-lg font-bold mb-4">Datos Metabólicos</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <StatBox label="TDEE" value={`${Math.round(metabolic.avg_tdee)} kcal`} color="text-primary" />
            <StatBox label="BMI" value={metabolic.bmi?.toFixed(1)} color="text-white" />
            <StatBox label="% Grasa" value={`${metabolic.avg_body_fat_pct?.toFixed(1)}%`} color="text-yellow-400" />
            <StatBox label="Masa muscular" value={`${metabolic.muscle_mass_kg?.toFixed(1)} kg`} color="text-cyan-400" />
            <StatBox label="Masa grasa" value={`${metabolic.avg_fat_mass_kg?.toFixed(1)} kg`} color="text-orange-400" />
            <StatBox label="Masa ósea" value={`${metabolic.bone_mass_kg?.toFixed(1)} kg`} color="text-gray-300" />
          </div>
          <p className="text-xs text-gray-500 mt-3">
            Calculado: {new Date(metabolic.calculated_at).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
        </div>
      )}

      {/* Nutrition Plan (read-only) */}
      {nutrition && (
        <div className="card mb-4">
          <h2 className="text-lg font-bold mb-4">Plan Nutricional</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatBox label="Calorías/día" value={nutrition.daily_calories} color="text-primary" />
            <StatBox label="Proteína" value={`${nutrition.protein_g}g`} color="text-green-400" />
            <StatBox label="Carbohidratos" value={`${nutrition.carbs_g}g`} color="text-blue-400" />
            <StatBox label="Grasas" value={`${nutrition.fat_g}g`} color="text-yellow-400" />
          </div>
          {nutrition.deficit_or_surplus && (
            <p className="text-xs text-gray-500 mt-3">
              {nutrition.deficit_or_surplus > 0 ? 'Superávit' : 'Déficit'}: {Math.abs(nutrition.deficit_or_surplus)} kcal/día
              {nutrition.timeline_days && ` · ${nutrition.timeline_days} días estimados`}
            </p>
          )}
        </div>
      )}

      {/* Workout Stats */}
      <div className="card mb-4">
        <h2 className="text-lg font-bold mb-4">Entrenamientos</h2>
        <div className="grid grid-cols-3 gap-3">
          <StatBox label="Total" value={stats.total_workouts} color="text-primary" />
          <StatBox label="Racha" value={`${stats.streak} días`} color="text-orange-400" />
          <StatBox label="Esta semana" value={stats.week_workouts} color="text-cyan-400" />
        </div>
      </div>

      {/* Health Info (read-only) */}
      {(profile.medical_conditions || profile.injuries || profile.allergies) && (
        <div className="card mb-4">
          <h2 className="text-lg font-bold mb-4">Información de Salud</h2>
          <div className="space-y-3">
            {profile.medical_conditions && <HealthField label="Condiciones médicas" value={profile.medical_conditions} />}
            {profile.injuries && <HealthField label="Lesiones" value={profile.injuries} />}
            {profile.medications && <HealthField label="Medicamentos" value={profile.medications} />}
            {profile.allergies && <HealthField label="Alergias" value={profile.allergies} />}
          </div>
        </div>
      )}
    </div>
  );
}

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

function HealthField({ label, value }) {
  return (
    <div>
      <span className="text-xs text-gray-500">{label}</span>
      <p className="text-sm text-gray-300">{value}</p>
    </div>
  );
}

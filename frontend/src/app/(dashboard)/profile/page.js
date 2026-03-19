'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { TOASTS } from '@/config/coach-voice';

const GOAL_LABELS = { lose_weight: 'Perder Peso', gain_muscle: 'Ganar Músculo', get_shredded: 'Definición' };
const DIET_LABELS = { standard: 'Estándar', keto: 'Keto', vegetarian: 'Vegetariano', vegan: 'Vegano', paleo: 'Paleo' };

export default function ProfilePage() {
  const toast = useToast();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [recalculating, setRecalculating] = useState(false);

  useEffect(() => {
    apiFetch('/api/users/me')
      .then(setProfile)
      .catch(() => toast.error(TOASTS.error_profile))
      .finally(() => setLoading(false));
  }, []);

  const update = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await apiFetch('/api/users/me', { method: 'PUT', body: profile });
      setProfile(updated);
      toast.success(TOASTS.profile_updated);
    } catch (err) {
      toast.error(TOASTS.error_save);
    }
    setSaving(false);
  };

  const handleRecalculate = async () => {
    if (!profile.weight_kg || !profile.height_cm || !profile.age) {
      toast.error(TOASTS.error_recalculate);
      return;
    }
    setRecalculating(true);
    try {
      // 1. Save current profile first
      await apiFetch('/api/users/me', { method: 'PUT', body: profile });

      // 2. Calculate metabolic data
      const metabolicResult = await apiFetch('/api/metabolic/calculate', {
        method: 'POST',
        body: {
          weight: profile.weight_kg,
          height: profile.height_cm,
          age: profile.age,
          sex: profile.sex,
          activityLevel: profile.activity_level,
          neck: profile.neck_cm || 38,
          waist: profile.waist_cm || 80,
          hip: profile.hip_cm || 90,
        },
      });

      // 3. Regenerate nutrition plan
      if (metabolicResult?.avg_tdee && profile.goal) {
        await apiFetch('/api/nutrition/plan', {
          method: 'POST',
          body: {
            tdee: metabolicResult.avg_tdee,
            goal: profile.goal,
            weight: profile.weight_kg,
            targetWeight: profile.target_weight_kg,
            mealsPerDay: profile.meals_per_day || 4,
          },
        });
      }

      // 4. Refresh profile to get new metabolic_result
      const refreshed = await apiFetch('/api/users/me');
      setProfile(refreshed);
      toast.success(TOASTS.metabolic_recalculated);
    } catch (err) {
      toast.error(TOASTS.error_recalculate_detail(err.message));
    }
    setRecalculating(false);
  };

  if (loading) return <div className="text-gray-400 text-center py-12">Cargando...</div>;
  if (!profile) return null;

  const metab = profile.metabolic_result;

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Mi Perfil</h1>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Datos Personales */}
        <div className="card">
          <h2 className="text-lg font-bold mb-4">Datos Personales</h2>
          <div className="space-y-4">
            <div>
              <label className="input-label">Nombre completo</label>
              <input className="input-field" value={profile.full_name || ''} onChange={e => update('full_name', e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="input-label">Sexo</label>
                <div className="flex gap-2">
                  <button type="button" onClick={() => update('sex', 'M')} className={`flex-1 py-3 rounded-xl text-sm font-bold transition-colors ${profile.sex === 'M' ? 'bg-primary text-black' : 'bg-dark-600 text-gray-400'}`}>Hombre</button>
                  <button type="button" onClick={() => update('sex', 'F')} className={`flex-1 py-3 rounded-xl text-sm font-bold transition-colors ${profile.sex === 'F' ? 'bg-primary text-black' : 'bg-dark-600 text-gray-400'}`}>Mujer</button>
                </div>
              </div>
              <div>
                <label className="input-label">Edad</label>
                <input type="number" className="input-field" value={profile.age || ''} onChange={e => update('age', Number(e.target.value))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="input-label">Peso actual (kg)</label>
                <input type="number" step="0.1" className="input-field" value={profile.weight_kg || ''} onChange={e => update('weight_kg', Number(e.target.value))} />
              </div>
              <div>
                <label className="input-label">Peso objetivo (kg)</label>
                <input type="number" step="0.1" className="input-field" value={profile.target_weight_kg || ''} onChange={e => update('target_weight_kg', Number(e.target.value))} />
              </div>
            </div>
            <div>
              <label className="input-label">Altura (cm)</label>
              <input type="number" step="0.1" className="input-field" value={profile.height_cm || ''} onChange={e => update('height_cm', Number(e.target.value))} />
            </div>
          </div>
        </div>

        {/* Medidas Corporales */}
        <div className="card">
          <h2 className="text-lg font-bold mb-4">Medidas Corporales</h2>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="input-label">Cuello (cm)</label>
              <input type="number" step="0.1" className="input-field" value={profile.neck_cm || ''} onChange={e => update('neck_cm', Number(e.target.value))} />
            </div>
            <div>
              <label className="input-label">Cintura (cm)</label>
              <input type="number" step="0.1" className="input-field" value={profile.waist_cm || ''} onChange={e => update('waist_cm', Number(e.target.value))} />
            </div>
            <div>
              <label className="input-label">Cadera (cm)</label>
              <input type="number" step="0.1" className="input-field" value={profile.hip_cm || ''} onChange={e => update('hip_cm', Number(e.target.value))} />
            </div>
          </div>
        </div>

        {/* Preferencias */}
        <div className="card">
          <h2 className="text-lg font-bold mb-4">Preferencias</h2>
          <div className="space-y-4">
            <div>
              <label className="input-label">Objetivo</label>
              <select className="input-field" value={profile.goal || ''} onChange={e => update('goal', e.target.value)}>
                <option value="">Seleccionar...</option>
                <option value="lose_weight">Perder Peso</option>
                <option value="gain_muscle">Ganar Músculo</option>
                <option value="get_shredded">Definición</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="input-label">Nivel de actividad</label>
                <select className="input-field" value={profile.activity_level || ''} onChange={e => update('activity_level', Number(e.target.value))}>
                  <option value="">Seleccionar...</option>
                  <option value="1">1 - Sedentario</option>
                  <option value="2">2 - Ligeramente activo</option>
                  <option value="3">3 - Moderadamente activo</option>
                  <option value="4">4 - Muy activo</option>
                  <option value="5">5 - Extremadamente activo</option>
                  <option value="6">6 - Atleta profesional</option>
                </select>
              </div>
              <div>
                <label className="input-label">Comidas por día</label>
                <select className="input-field" value={profile.meals_per_day || 4} onChange={e => update('meals_per_day', Number(e.target.value))}>
                  <option value="2">2 comidas</option>
                  <option value="3">3 comidas</option>
                  <option value="4">4 comidas</option>
                  <option value="5">5 comidas</option>
                  <option value="6">6 comidas</option>
                </select>
              </div>
            </div>
            <div>
              <label className="input-label">Tipo de dieta</label>
              <select className="input-field" value={profile.diet_type || 'standard'} onChange={e => update('diet_type', e.target.value)}>
                <option value="standard">Estándar</option>
                <option value="keto">Keto</option>
                <option value="vegetarian">Vegetariano</option>
                <option value="vegan">Vegano</option>
                <option value="paleo">Paleo</option>
              </select>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <button type="submit" disabled={saving} className="btn-primary w-full disabled:opacity-50">
          {saving ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </form>

      {/* Metabolic Summary */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Resumen Metabólico</h2>
          {metab?.calculated_at && (
            <span className="text-xs text-gray-500">
              Calculado: {new Date(metab.calculated_at).toLocaleDateString('es')}
            </span>
          )}
        </div>

        {metab ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-dark-700 rounded-xl p-3 text-center">
                <div className="text-xs text-gray-400">TDEE</div>
                <div className="text-lg font-bold text-primary">{Math.round(metab.avg_tdee)}</div>
                <div className="text-xs text-gray-500">kcal/día</div>
              </div>
              <div className="bg-dark-700 rounded-xl p-3 text-center">
                <div className="text-xs text-gray-400">% Grasa</div>
                <div className="text-lg font-bold">{metab.avg_body_fat_pct?.toFixed(1)}%</div>
              </div>
              <div className="bg-dark-700 rounded-xl p-3 text-center">
                <div className="text-xs text-gray-400">M. Muscular</div>
                <div className="text-lg font-bold text-cyan-400">{metab.muscle_mass_kg?.toFixed(1)} kg</div>
              </div>
              <div className="bg-dark-700 rounded-xl p-3 text-center">
                <div className="text-xs text-gray-400">BMI</div>
                <div className="text-lg font-bold">{metab.bmi?.toFixed(1)}</div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleRecalculate}
              disabled={recalculating}
              className="w-full py-3 rounded-xl border border-primary text-primary font-bold hover:bg-primary/10 transition-colors disabled:opacity-50"
            >
              {recalculating ? 'Recalculando...' : 'Recalcular Metabolismo'}
            </button>
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-gray-400 mb-4">No hay datos metabólicos. Recalcula con tus medidas actuales.</p>
            <button
              type="button"
              onClick={handleRecalculate}
              disabled={recalculating}
              className="btn-primary disabled:opacity-50"
            >
              {recalculating ? 'Calculando...' : 'Calcular Metabolismo'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

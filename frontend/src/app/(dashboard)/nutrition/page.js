'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { useToast } from '@/context/ToastContext';

export default function NutritionPage() {
  const toast = useToast();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/api/nutrition/plan')
      .then(setPlan)
      .catch(() => { toast.error('Error al cargar plan nutricional'); setPlan(null); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-gray-400 text-center py-12">Cargando...</div>;

  if (!plan) {
    return (
      <div className="text-center py-16">
        <div className="w-20 h-20 rounded-full bg-dark-600 flex items-center justify-center mx-auto mb-6">
          <span className="text-3xl text-gray-500 font-bold">N</span>
        </div>
        <h1 className="text-2xl font-bold mb-3">Plan Nutricional</h1>
        <p className="text-gray-400 mb-2 max-w-md mx-auto">
          Aun no tienes un plan nutricional generado.
        </p>
        <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto">
          Completa el onboarding o ve a tu perfil para calcular tu metabolismo y generar tu plan personalizado.
        </p>
        <div className="flex gap-3 justify-center">
          <a href="/onboarding" className="btn-primary">Onboarding</a>
          <a href="/profile" className="btn-secondary">Mi Perfil</a>
        </div>
      </div>
    );
  }

  const goalLabels = { lose_weight: 'Perder Peso', gain_muscle: 'Ganar Musculo', get_shredded: 'Definicion' };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Plan Nutricional</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="card text-center py-4">
          <div className="text-xs text-gray-400">Calorias/dia</div>
          <div className="text-2xl font-bold text-primary">{plan.daily_calories}</div>
        </div>
        <div className="card text-center py-4">
          <div className="text-xs text-gray-400">Proteina</div>
          <div className="text-2xl font-bold">{plan.protein_g}g</div>
        </div>
        <div className="card text-center py-4">
          <div className="text-xs text-gray-400">Carbohidratos</div>
          <div className="text-2xl font-bold">{plan.carbs_g}g</div>
        </div>
        <div className="card text-center py-4">
          <div className="text-xs text-gray-400">Grasas</div>
          <div className="text-2xl font-bold">{plan.fat_g}g</div>
        </div>
      </div>

      {/* Macro Bar */}
      <div className="card mb-6">
        <h2 className="text-sm font-bold text-gray-400 uppercase mb-3">Distribucion de Macros</h2>
        <MacroBar protein={plan.protein_g} carbs={plan.carbs_g} fat={plan.fat_g} />
      </div>

      {/* Goal & Timeline */}
      <div className="card mb-6">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Objetivo</span>
            <span className="font-bold">{goalLabels[plan.goal] || plan.goal}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">{plan.deficit_or_surplus > 0 ? 'Superavit' : 'Deficit'}</span>
            <span className="font-bold">{Math.abs(plan.deficit_or_surplus)} kcal/dia</span>
          </div>
          {plan.timeline_days && (
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Tiempo estimado</span>
              <span className="font-bold text-primary">
                {plan.timeline_days} dias ({Math.round(plan.timeline_days / 7)} semanas)
              </span>
            </div>
          )}
          {plan.projected_change_kg && (
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Cambio proyectado</span>
              <span className="font-bold">
                {plan.projected_change_kg > 0 ? '+' : ''}{plan.projected_change_kg} kg
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Meal Distribution */}
      {plan.meal_distribution && (
        <div className="card">
          <h2 className="text-lg font-bold mb-4">Distribucion por Comida</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400 border-b border-dark-500">
                  <th className="text-left py-2">Comida</th>
                  <th className="text-right py-2">%</th>
                  <th className="text-right py-2">Cal</th>
                  <th className="text-right py-2">Prot</th>
                  <th className="text-right py-2">Carbs</th>
                  <th className="text-right py-2">Grasa</th>
                </tr>
              </thead>
              <tbody>
                {plan.meal_distribution.map((meal, i) => (
                  <tr key={i} className="border-b border-dark-600">
                    <td className="py-3 font-medium">{meal.name}</td>
                    <td className="py-3 text-right text-gray-400">{meal.percentage}%</td>
                    <td className="py-3 text-right text-primary font-bold">{meal.calories}</td>
                    <td className="py-3 text-right">{meal.protein_g}g</td>
                    <td className="py-3 text-right">{meal.carbs_g}g</td>
                    <td className="py-3 text-right">{meal.fat_g}g</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function MacroBar({ protein, carbs, fat }) {
  const pCal = protein * 4;
  const cCal = carbs * 4;
  const fCal = fat * 9;
  const total = pCal + cCal + fCal;
  if (total === 0) return null;

  const pPct = (pCal / total) * 100;
  const cPct = (cCal / total) * 100;
  const fPct = (fCal / total) * 100;

  return (
    <div>
      <div className="flex h-4 rounded-full overflow-hidden">
        <div className="bg-primary" style={{ width: `${pPct}%` }} />
        <div className="bg-cyan-400" style={{ width: `${cPct}%` }} />
        <div className="bg-yellow-400" style={{ width: `${fPct}%` }} />
      </div>
      <div className="flex justify-between mt-2 text-xs text-gray-400">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-primary inline-block" /> Proteina {Math.round(pPct)}%
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block" /> Carbs {Math.round(cPct)}%
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" /> Grasa {Math.round(fPct)}%
        </span>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { TOASTS } from '@/config/coach-voice';
import { COLORS, BRAND } from '@/lib/design-tokens';

export default function NutritionPage() {
  const toast = useToast();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [expandedMeals, setExpandedMeals] = useState({});

  useEffect(() => {
    apiFetch('/api/nutrition/plan')
      .then(setPlan)
      .catch(() => { toast.error(TOASTS.error_nutrition); setPlan(null); })
      .finally(() => setLoading(false));
  }, []);

  const toggleMeal = (idx) => {
    setExpandedMeals(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleRegenerateSuggestions = async () => {
    setRegenerating(true);
    try {
      const updated = await apiFetch('/api/nutrition/regenerate-suggestions', { method: 'POST', body: {} });
      setPlan(updated);
      toast.success(TOASTS.plan_generated);
    } catch (err) {
      toast.error(TOASTS.error_nutrition);
    }
    setRegenerating(false);
  };

  if (loading) return <div className="text-gray-400 text-center py-12">Cargando...</div>;

  if (!plan) {
    return (
      <div className="text-center py-16">
        <div className="w-20 h-20 rounded-full bg-dark-600 flex items-center justify-center mx-auto mb-6">
          <span className="text-3xl text-gray-500 font-bold">N</span>
        </div>
        <h1 className="text-2xl font-bold mb-3">Plan Nutricional</h1>
        <p className="text-gray-400 mb-2 max-w-md mx-auto">
          Aún no tienes un plan nutricional generado.
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

  const goalLabels = COLORS.goal;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Plan Nutricional</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="card text-center py-4">
          <div className="text-xs text-gray-400">Calorías/día</div>
          <div className="text-2xl font-bold text-primary">{plan.daily_calories}</div>
        </div>
        <div className="card text-center py-4">
          <div className="text-xs text-gray-400">Proteína</div>
          <div className={`text-2xl font-bold ${COLORS.protein.text}`}>{plan.protein_g}g</div>
        </div>
        <div className="card text-center py-4">
          <div className="text-xs text-gray-400">Carbohidratos</div>
          <div className={`text-2xl font-bold ${COLORS.carbs.text}`}>{plan.carbs_g}g</div>
        </div>
        <div className="card text-center py-4">
          <div className="text-xs text-gray-400">Grasas</div>
          <div className={`text-2xl font-bold ${COLORS.fat.text}`}>{plan.fat_g}g</div>
        </div>
      </div>

      {/* Macro Bar */}
      <div className="card mb-6">
        <h2 className="text-sm font-bold text-gray-400 uppercase mb-3">Distribución de Macros</h2>
        <MacroBar protein={plan.protein_g} carbs={plan.carbs_g} fat={plan.fat_g} />
      </div>

      {/* Goal & Timeline */}
      <div className="card mb-6">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Objetivo</span>
            <span className={`font-bold ${goalLabels[plan.goal]?.text || ''}`}>
              {goalLabels[plan.goal]?.label || plan.goal}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">{plan.deficit_or_surplus > 0 ? 'Superavit' : 'Deficit'}</span>
            <span className="font-bold">{Math.abs(plan.deficit_or_surplus)} kcal/día</span>
          </div>
          {plan.timeline_days && (
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Tiempo estimado</span>
              <span className="font-bold text-primary">
                {plan.timeline_days} días ({Math.round(plan.timeline_days / 7)} semanas)
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

      {/* Meal Distribution Table */}
      {plan.meal_distribution && (
        <div className="card mb-6">
          <h2 className="text-lg font-bold mb-4">Distribución por Comida</h2>
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

      {/* Meal Suggestions */}
      {plan.meal_distribution && (() => {
        const hasSuggestions = plan.meal_distribution.some(m => m.suggestions && m.suggestions.length > 0);
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Sugerencias de Alimentos</h2>
              <button
                onClick={handleRegenerateSuggestions}
                disabled={regenerating}
                className="text-xs px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors disabled:opacity-50"
              >
                {regenerating ? 'Generando...' : hasSuggestions ? 'Nuevas opciones' : 'Generar sugerencias'}
              </button>
            </div>
            {hasSuggestions ? (
              plan.meal_distribution.map((meal, idx) => (
                <MealSuggestionCard
                  key={idx}
                  meal={meal}
                  expanded={expandedMeals[idx] !== false}
                  onToggle={() => toggleMeal(idx)}
                />
              ))
            ) : (
              <div className="card text-center py-8">
                <p className="text-gray-400 mb-3">Tu plan aún no tiene sugerencias de alimentos</p>
                <button
                  onClick={handleRegenerateSuggestions}
                  disabled={regenerating}
                  className="btn-primary"
                >
                  {regenerating ? 'Generando...' : 'Generar sugerencias de alimentos'}
                </button>
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
}

// ─── Meal Suggestion Card ─────────────────────────────────────────────────

function MealSuggestionCard({ meal, expanded, onToggle }) {
  const suggestions = meal.suggestions || [];
  const totals = meal.suggestion_totals;
  const matchPct = meal.match_pct;

  if (suggestions.length === 0) return null;

  return (
    <div className="card overflow-hidden">
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-1"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <MealIcon name={meal.name} />
          </div>
          <div className="text-left">
            <h3 className="font-bold">{meal.name}</h3>
            <p className="text-xs text-gray-400">{meal.calories} kcal objetivo</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {matchPct != null && (
            <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
              matchPct >= 95 ? 'bg-green-400/10 text-green-400' :
              matchPct >= 85 ? 'bg-yellow-400/10 text-yellow-400' :
              'bg-red-400/10 text-red-400'
            }`}>
              {matchPct}% match
            </span>
          )}
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Content */}
      {expanded && (
        <div className="mt-4 space-y-2">
          {suggestions.map((s, i) => {
            const catStyle = COLORS.foodCategory[s.category] || COLORS.foodCategory.Proteinas;
            return (
              <div key={i} className={`flex items-center justify-between p-3 rounded-xl ${catStyle.bg} border ${catStyle.border}`}>
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${catStyle.dot}`} />
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{s.name}</p>
                    <p className={`text-xs ${catStyle.text}`}>{s.display_amount}</p>
                  </div>
                </div>
                <div className="flex gap-4 text-xs text-gray-400 flex-shrink-0 ml-4">
                  <span className="text-primary font-bold">{s.calories}</span>
                  <span className={COLORS.protein.text}>{s.protein_g}p</span>
                  <span className={COLORS.carbs.text}>{s.carbs_g}c</span>
                  <span className={COLORS.fat.text}>{s.fat_g}g</span>
                </div>
              </div>
            );
          })}

          {/* Totals vs Target */}
          {totals && (
            <div className="mt-3 pt-3 border-t border-dark-500">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Sugerido</span>
                <div className="flex gap-4 text-gray-400">
                  <span className="text-primary font-bold">{totals.calories} cal</span>
                  <span>{totals.protein_g}p</span>
                  <span>{totals.carbs_g}c</span>
                  <span>{totals.fat_g}g</span>
                </div>
              </div>
              <div className="flex justify-between text-xs mt-1">
                <span className="text-gray-500">Objetivo</span>
                <div className="flex gap-4 text-gray-500">
                  <span className="font-bold">{meal.calories} cal</span>
                  <span>{meal.protein_g}p</span>
                  <span>{meal.carbs_g}c</span>
                  <span>{meal.fat_g}g</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Meal Icon ────────────────────────────────────────────────────────────

function MealIcon({ name }) {
  const n = (name || '').toLowerCase();
  if (n.includes('desayuno')) return (
    <svg className="w-5 h-5 text-[#00ff88]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
    </svg>
  );
  if (n.includes('almuerzo')) return (
    <svg className="w-5 h-5 text-[#00ff88]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.871c1.355 0 2.697.056 4.024.166C17.155 8.51 18 9.473 18 10.608v2.513M15 8.25v-1.5m-6 1.5v-1.5m12 9.75l-1.5.75a3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0L3 16.5m15-3.379a48.474 48.474 0 00-6-.371c-2.032 0-4.034.126-6 .371m12 0c.39.049.777.102 1.163.16 1.07.16 1.837 1.094 1.837 2.175v5.169c0 .621-.504 1.125-1.125 1.125H4.125A1.125 1.125 0 013 20.625v-5.17c0-1.08.768-2.014 1.837-2.174A47.78 47.78 0 016 13.12M12.265 3.11a.375.375 0 11-.53 0L12 2.845l.265.265z" />
    </svg>
  );
  if (n.includes('cena')) return (
    <svg className="w-5 h-5 text-[#00ff88]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
    </svg>
  );
  if (n.includes('snack')) return (
    <svg className="w-5 h-5 text-[#00ff88]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
    </svg>
  );
  return (
    <svg className="w-5 h-5 text-[#00ff88]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.871c1.355 0 2.697.056 4.024.166C17.155 8.51 18 9.473 18 10.608v2.513M15 8.25v-1.5m-6 1.5v-1.5m12 9.75l-1.5.75a3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0L3 16.5m15-3.379a48.474 48.474 0 00-6-.371c-2.032 0-4.034.126-6 .371m12 0c.39.049.777.102 1.163.16 1.07.16 1.837 1.094 1.837 2.175v5.169c0 .621-.504 1.125-1.125 1.125H4.125A1.125 1.125 0 013 20.625v-5.17c0-1.08.768-2.014 1.837-2.174A47.78 47.78 0 016 13.12M12.265 3.11a.375.375 0 11-.53 0L12 2.845l.265.265z" />
    </svg>
  );
}

// ─── Macro Bar ────────────────────────────────────────────────────────────

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
        <div className={COLORS.protein.bg} style={{ width: `${pPct}%` }} />
        <div className={COLORS.carbs.bg} style={{ width: `${cPct}%` }} />
        <div className={COLORS.fat.bg} style={{ width: `${fPct}%` }} />
      </div>
      <div className="flex justify-between mt-2 text-xs text-gray-400">
        <span className="flex items-center gap-1">
          <span className={`w-2 h-2 rounded-full ${COLORS.protein.bg} inline-block`} /> Proteína {Math.round(pPct)}%
        </span>
        <span className="flex items-center gap-1">
          <span className={`w-2 h-2 rounded-full ${COLORS.carbs.bg} inline-block`} /> Carbs {Math.round(cPct)}%
        </span>
        <span className="flex items-center gap-1">
          <span className={`w-2 h-2 rounded-full ${COLORS.fat.bg} inline-block`} /> Grasa {Math.round(fPct)}%
        </span>
      </div>
    </div>
  );
}

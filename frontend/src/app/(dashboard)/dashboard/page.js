'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import Link from 'next/link';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Buenos dias';
  if (hour < 19) return 'Buenas tardes';
  return 'Buenas noches';
}

const GOAL_LABELS = {
  lose_weight: { label: 'Perder peso', color: 'text-orange-400 bg-orange-400/10 border-orange-400/30' },
  gain_muscle: { label: 'Ganar musculo', color: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/30' },
  get_shredded: { label: 'Definicion', color: 'text-purple-400 bg-purple-400/10 border-purple-400/30' },
};

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [nutrition, setNutrition] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiFetch('/api/users/me').catch(() => null),
      apiFetch('/api/users/me/stats').catch(() => null),
      apiFetch('/api/nutrition/plan').catch(() => null),
    ]).then(([userData, statsData, nutritionData]) => {
      setUser(userData);
      setStats(statsData);
      setNutrition(nutritionData);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <div className="text-gray-400 text-sm">Cargando...</div>
        </div>
      </div>
    );
  }

  const metab = user?.metabolic_result;
  const hasMetabolicData = !!metab;
  const goalInfo = GOAL_LABELS[user?.goal] || null;

  return (
    <div className="animate-slide-up-page">
      {/* Greeting + Goal */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold mb-1">
          {getGreeting()}, <span className="gradient-text">{user?.full_name || 'Coach'}</span>
        </h1>
        <div className="flex items-center gap-2 mt-2">
          <p className="text-sm text-gray-400">Tu resumen de hoy</p>
          {goalInfo && (
            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${goalInfo.color}`}>
              {goalInfo.label}
            </span>
          )}
        </div>
      </div>

      {/* Welcome Card for new users (no metabolic data) */}
      {!hasMetabolicData && (
        <div className="card mb-6 relative overflow-hidden stagger-1 animate-fade-in" style={{ animationFillMode: 'both' }}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-10 -mt-10" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <h2 className="text-lg font-bold">Bienvenido a App Coach</h2>
            </div>
            <p className="text-sm text-gray-400 mb-4">
              Comienza calculando tu perfil metabolico para obtener un plan personalizado de nutricion y entrenamiento.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/calculator"
                className="btn-primary text-sm py-2.5 px-5 inline-flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
                Ir a la Calculadora
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="card text-center py-5 relative overflow-hidden stagger-1 animate-fade-in" style={{ animationFillMode: 'both' }}>
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
          <div className="relative">
            <div className="flex justify-center mb-2">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
            </div>
            <div className="text-2xl font-bold text-primary">{stats?.total_workouts || 0}</div>
            <div className="text-xs text-gray-400 mt-1">Total</div>
          </div>
        </div>

        <div className="card text-center py-5 relative overflow-hidden stagger-2 animate-fade-in" style={{ animationFillMode: 'both' }}>
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent" />
          <div className="relative">
            <div className="flex justify-center mb-2">
              <div className="w-9 h-9 rounded-xl bg-orange-500/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                </svg>
              </div>
            </div>
            <div className="text-2xl font-bold text-orange-400">{stats?.streak || 0}</div>
            <div className="text-xs text-gray-400 mt-1">Racha (dias)</div>
          </div>
        </div>

        <div className="card text-center py-5 relative overflow-hidden stagger-3 animate-fade-in" style={{ animationFillMode: 'both' }}>
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent" />
          <div className="relative">
            <div className="flex justify-center mb-2">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <div className="text-2xl font-bold text-cyan-400">{stats?.week_workouts || 0}</div>
            <div className="text-xs text-gray-400 mt-1">Esta Semana</div>
          </div>
        </div>
      </div>

      {/* Metabolic Summary */}
      {metab && (
        <div className="card mb-4 stagger-4 animate-fade-in" style={{ animationFillMode: 'both' }}>
          <h2 className="text-sm font-bold text-gray-400 uppercase mb-4 flex items-center gap-2">
            <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Metabolismo
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-xs text-gray-500 mb-1">TDEE</div>
              <div className="text-xl font-bold text-primary">{Math.round(metab.avg_tdee)} <span className="text-xs text-gray-400">kcal</span></div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Grasa corporal</div>
              <div className="text-xl font-bold">{metab.avg_body_fat_pct?.toFixed(1)}%</div>
              {/* Body fat progress bar */}
              <BodyFatBar percent={metab.avg_body_fat_pct} sex={user?.sex} />
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Masa muscular</div>
              <div className="text-xl font-bold text-cyan-400">{metab.muscle_mass_kg?.toFixed(1)} kg</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">BMI</div>
              <div className="text-xl font-bold">{metab.bmi?.toFixed(1)}</div>
            </div>
          </div>
        </div>
      )}

      {/* Nutrition Summary */}
      {nutrition && (
        <div className="card mb-6 stagger-5 animate-fade-in" style={{ animationFillMode: 'both' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-gray-400 uppercase flex items-center gap-2">
              <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
              </svg>
              Plan Nutricional
            </h2>
            <Link href="/nutrition" className="text-xs text-primary hover:underline flex items-center gap-1">
              Ver detalle
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Progress Ring */}
            <div className="flex-shrink-0">
              <CalorieRing calories={nutrition.daily_calories} />
            </div>

            {/* Macros */}
            <div className="flex-1 w-full">
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="text-center p-3 rounded-xl bg-primary/5 border border-primary/10">
                  <div className="text-lg font-bold text-primary">{nutrition.protein_g}g</div>
                  <div className="text-xs text-gray-500">Proteina</div>
                </div>
                <div className="text-center p-3 rounded-xl bg-cyan-400/5 border border-cyan-400/10">
                  <div className="text-lg font-bold text-cyan-400">{nutrition.carbs_g}g</div>
                  <div className="text-xs text-gray-500">Carbs</div>
                </div>
                <div className="text-center p-3 rounded-xl bg-yellow-400/5 border border-yellow-400/10">
                  <div className="text-lg font-bold text-yellow-400">{nutrition.fat_g}g</div>
                  <div className="text-xs text-gray-500">Grasa</div>
                </div>
              </div>
              <MacroBar protein={nutrition.protein_g} carbs={nutrition.carbs_g} fat={nutrition.fat_g} />
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 stagger-6 animate-fade-in" style={{ animationFillMode: 'both' }}>
        <Link href="/workouts" className="card hover:border-primary/50 transition-all group">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold mb-0.5">Entrenamientos</h3>
              <p className="text-xs text-gray-400">Ver rutinas disponibles</p>
            </div>
          </div>
        </Link>
        <Link href="/nutrition" className="card hover:border-primary/50 transition-all group">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center group-hover:bg-orange-500/20 transition-colors">
              <svg className="w-5 h-5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold mb-0.5">Plan Nutricional</h3>
              <p className="text-xs text-gray-400">Tu plan de alimentacion</p>
            </div>
          </div>
        </Link>
        <Link href="/calculator" className="card hover:border-primary/50 transition-all group">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center group-hover:bg-cyan-500/20 transition-colors">
              <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold mb-0.5">Calculadora</h3>
              <p className="text-xs text-gray-400">Calculadora metabolica</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}

/* ---- Sub-components ---- */

function CalorieRing({ calories }) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  // Static 65% fill for visual appeal
  const progress = 0.65;
  const offset = circumference * (1 - progress);

  return (
    <div className="relative w-32 h-32">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
        {/* Background ring */}
        <circle cx="60" cy="60" r={radius} fill="none" stroke="#333333" strokeWidth="8" />
        {/* Progress ring */}
        <circle
          cx="60" cy="60" r={radius}
          fill="none"
          stroke="url(#calorieGradient)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
        <defs>
          <linearGradient id="calorieGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00ff88" />
            <stop offset="100%" stopColor="#00ddff" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold text-white">{calories}</span>
        <span className="text-[10px] text-gray-400">kcal/dia</span>
      </div>
    </div>
  );
}

function BodyFatBar({ percent, sex }) {
  if (percent == null) return null;

  // Ideal body fat ranges
  const idealMin = sex === 'female' ? 18 : 10;
  const idealMax = sex === 'female' ? 28 : 20;
  const maxRange = sex === 'female' ? 45 : 35;

  const clampedPct = Math.min(percent, maxRange);
  const position = (clampedPct / maxRange) * 100;
  const idealStart = (idealMin / maxRange) * 100;
  const idealEnd = (idealMax / maxRange) * 100;

  const isInRange = percent >= idealMin && percent <= idealMax;

  return (
    <div className="mt-2">
      <div className="relative h-2 rounded-full bg-dark-600 overflow-hidden">
        {/* Ideal range highlight */}
        <div
          className="absolute top-0 bottom-0 bg-primary/20 rounded-full"
          style={{ left: `${idealStart}%`, width: `${idealEnd - idealStart}%` }}
        />
        {/* Current position indicator */}
        <div
          className={`absolute top-0 bottom-0 w-2 rounded-full ${isInRange ? 'bg-primary' : 'bg-orange-400'}`}
          style={{ left: `${Math.min(position, 97)}%` }}
        />
      </div>
      <div className="flex justify-between mt-0.5">
        <span className="text-[9px] text-gray-600">{idealMin}%</span>
        <span className={`text-[9px] ${isInRange ? 'text-primary' : 'text-orange-400'}`}>
          {isInRange ? 'Rango ideal' : percent < idealMin ? 'Bajo' : 'Alto'}
        </span>
        <span className="text-[9px] text-gray-600">{idealMax}%</span>
      </div>
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
      <div className="flex h-2.5 rounded-full overflow-hidden gap-0.5">
        <div className="bg-primary rounded-l-full" style={{ width: `${pPct}%` }} />
        <div className="bg-cyan-400" style={{ width: `${cPct}%` }} />
        <div className="bg-yellow-400 rounded-r-full" style={{ width: `${fPct}%` }} />
      </div>
      <div className="flex justify-between mt-1.5 text-[10px] text-gray-500">
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
          Prot {Math.round(pPct)}%
        </span>
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 inline-block" />
          Carbs {Math.round(cPct)}%
        </span>
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 inline-block" />
          Grasa {Math.round(fPct)}%
        </span>
      </div>
    </div>
  );
}

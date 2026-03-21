'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { TOASTS } from '@/config/coach-voice';

export default function ProgressPage() {
  const toast = useToast();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    weight_kg: '', neck_cm: '', waist_cm: '', hip_cm: '',
    chest_cm: '', arm_cm: '', thigh_cm: '', notes: '',
  });

  const loadEntries = () => {
    setLoading(true);
    apiFetch('/api/progress')
      .then(setEntries)
      .catch(() => toast.error('Error al cargar progreso'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadEntries(); }, []);

  const handleSubmit = async () => {
    const hasData = Object.values(form).some(v => v !== '' && v !== null);
    if (!hasData) { toast.error('Ingresa al menos un dato'); return; }

    setSaving(true);
    try {
      const body = {};
      Object.entries(form).forEach(([k, v]) => {
        if (v !== '' && v !== null) body[k] = typeof v === 'string' && !isNaN(v) ? Number(v) : v;
      });

      await apiFetch('/api/progress', { method: 'POST', body });
      toast.success(TOASTS.progress_saved || 'Progreso registrado');
      setForm({ weight_kg: '', neck_cm: '', waist_cm: '', hip_cm: '', chest_cm: '', arm_cm: '', thigh_cm: '', notes: '' });
      setShowForm(false);
      loadEntries();
    } catch (err) {
      toast.error(err.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  // Calculate trends
  const latest = entries[0];
  const previous = entries[1];
  const first = entries[entries.length - 1];

  const weightTrend = latest?.weight_kg && previous?.weight_kg
    ? (latest.weight_kg - previous.weight_kg).toFixed(1)
    : null;
  const totalChange = latest?.weight_kg && first?.weight_kg && entries.length > 1
    ? (latest.weight_kg - first.weight_kg).toFixed(1)
    : null;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Mi Progreso</h1>
        <button onClick={() => setShowForm(!showForm)}
          className={`px-4 py-2 text-sm rounded-xl font-bold transition-colors ${
            showForm ? 'bg-dark-600 text-gray-300' : 'btn-primary'
          }`}>
          {showForm ? 'Cancelar' : '+ Registrar medicion'}
        </button>
      </div>

      {/* New Entry Form */}
      {showForm && (
        <div className="card mb-6">
          <h2 className="font-bold mb-4">Nueva medicion</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <FormField label="Peso (kg)" value={form.weight_kg}
              onChange={v => setForm(f => ({ ...f, weight_kg: v }))} />
            <FormField label="Cuello (cm)" value={form.neck_cm}
              onChange={v => setForm(f => ({ ...f, neck_cm: v }))} />
            <FormField label="Cintura (cm)" value={form.waist_cm}
              onChange={v => setForm(f => ({ ...f, waist_cm: v }))} />
            <FormField label="Cadera (cm)" value={form.hip_cm}
              onChange={v => setForm(f => ({ ...f, hip_cm: v }))} />
            <FormField label="Pecho (cm)" value={form.chest_cm}
              onChange={v => setForm(f => ({ ...f, chest_cm: v }))} />
            <FormField label="Brazo (cm)" value={form.arm_cm}
              onChange={v => setForm(f => ({ ...f, arm_cm: v }))} />
            <FormField label="Muslo (cm)" value={form.thigh_cm}
              onChange={v => setForm(f => ({ ...f, thigh_cm: v }))} />
          </div>
          <div className="mb-4">
            <label className="text-xs text-gray-500 block mb-1">Notas (opcional)</label>
            <input type="text" value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              className="input-field w-full text-sm" placeholder="Como te sientes hoy..." />
          </div>
          <button onClick={handleSubmit} disabled={saving}
            className="btn-primary w-full py-3 disabled:opacity-50">
            {saving ? 'Guardando...' : 'Registrar progreso'}
          </button>
        </div>
      )}

      {/* Summary Cards */}
      {latest && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="card text-center py-4">
            <div className="text-2xl font-bold text-white">{latest.weight_kg || '-'}</div>
            <div className="text-xs text-gray-400">Peso actual (kg)</div>
          </div>
          <div className="card text-center py-4">
            <div className={`text-2xl font-bold ${
              weightTrend === null ? 'text-gray-400' :
              Number(weightTrend) < 0 ? 'text-green-400' : Number(weightTrend) > 0 ? 'text-orange-400' : 'text-gray-400'
            }`}>
              {weightTrend !== null ? (Number(weightTrend) > 0 ? '+' : '') + weightTrend : '-'}
            </div>
            <div className="text-xs text-gray-400">vs anterior (kg)</div>
          </div>
          <div className="card text-center py-4">
            <div className={`text-2xl font-bold ${
              totalChange === null ? 'text-gray-400' :
              Number(totalChange) < 0 ? 'text-green-400' : Number(totalChange) > 0 ? 'text-orange-400' : 'text-gray-400'
            }`}>
              {totalChange !== null ? (Number(totalChange) > 0 ? '+' : '') + totalChange : '-'}
            </div>
            <div className="text-xs text-gray-400">Cambio total (kg)</div>
          </div>
          <div className="card text-center py-4">
            <div className="text-2xl font-bold text-primary">{entries.length}</div>
            <div className="text-xs text-gray-400">Registros</div>
          </div>
        </div>
      )}

      {/* Weight Chart (text-based timeline) */}
      {entries.length > 1 && (
        <div className="card mb-6">
          <h2 className="font-bold mb-4">Linea de tiempo - Peso</h2>
          <WeightChart entries={entries.filter(e => e.weight_kg).slice(0, 20).reverse()} />
        </div>
      )}

      {/* Measurements Timeline */}
      {entries.length > 0 && (
        <div className="card mb-6">
          <h2 className="font-bold mb-4">Historial de mediciones</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 text-xs border-b border-dark-600">
                  <th className="text-left py-2 font-medium">Fecha</th>
                  <th className="text-center py-2 font-medium">Peso</th>
                  <th className="text-center py-2 font-medium">Cuello</th>
                  <th className="text-center py-2 font-medium">Cintura</th>
                  <th className="text-center py-2 font-medium">Cadera</th>
                  <th className="text-center py-2 font-medium">Pecho</th>
                  <th className="text-center py-2 font-medium">Brazo</th>
                  <th className="text-center py-2 font-medium">Muslo</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((e, i) => {
                  const prev = entries[i + 1];
                  return (
                    <tr key={e.id} className="border-b border-dark-700 last:border-0">
                      <td className="py-2 text-gray-300">
                        {new Date(e.recorded_at).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}
                      </td>
                      <MeasureCell value={e.weight_kg} prev={prev?.weight_kg} unit="kg" />
                      <MeasureCell value={e.neck_cm} prev={prev?.neck_cm} unit="cm" />
                      <MeasureCell value={e.waist_cm} prev={prev?.waist_cm} unit="cm" />
                      <MeasureCell value={e.hip_cm} prev={prev?.hip_cm} unit="cm" />
                      <MeasureCell value={e.chest_cm} prev={prev?.chest_cm} unit="cm" />
                      <MeasureCell value={e.arm_cm} prev={prev?.arm_cm} unit="cm" />
                      <MeasureCell value={e.thigh_cm} prev={prev?.thigh_cm} unit="cm" />
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && entries.length === 0 && !showForm && (
        <div className="card text-center py-12">
          <svg className="w-12 h-12 mx-auto mb-3 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
          </svg>
          <h3 className="font-bold text-lg mb-1">Sin registros de progreso</h3>
          <p className="text-gray-400 text-sm mb-4">Registra tu primera medicion para comenzar a ver tu progreso</p>
          <button onClick={() => setShowForm(true)} className="btn-primary px-6 py-2">
            Registrar primera medicion
          </button>
        </div>
      )}

      {loading && <div className="text-gray-400 text-center py-12">Cargando progreso...</div>}
    </div>
  );
}

// ─── Components ─────────────────────────────────────────────────────────

function FormField({ label, value, onChange }) {
  return (
    <div>
      <label className="text-xs text-gray-500 block mb-1">{label}</label>
      <input type="number" step="0.1" value={value}
        onChange={e => onChange(e.target.value)}
        className="input-field w-full text-sm" placeholder="-" />
    </div>
  );
}

function MeasureCell({ value, prev, unit }) {
  if (!value) return <td className="py-2 text-center text-gray-600">-</td>;
  const diff = prev ? (value - prev).toFixed(1) : null;
  const color = diff === null ? 'text-white' :
    Number(diff) < 0 ? 'text-green-400' :
    Number(diff) > 0 ? 'text-orange-400' : 'text-gray-400';

  return (
    <td className="py-2 text-center">
      <span className={color}>{value}</span>
      {diff !== null && Number(diff) !== 0 && (
        <span className={`text-[10px] ml-0.5 ${color}`}>
          ({Number(diff) > 0 ? '+' : ''}{diff})
        </span>
      )}
    </td>
  );
}

function WeightChart({ entries }) {
  if (entries.length < 2) return null;

  const weights = entries.map(e => Number(e.weight_kg));
  const min = Math.min(...weights) - 1;
  const max = Math.max(...weights) + 1;
  const range = max - min || 1;
  const chartHeight = 120;

  return (
    <div className="relative" style={{ height: chartHeight + 30 }}>
      {/* Y axis labels */}
      <div className="absolute left-0 top-0 bottom-6 w-10 flex flex-col justify-between text-[10px] text-gray-500">
        <span>{max.toFixed(0)}</span>
        <span>{((max + min) / 2).toFixed(0)}</span>
        <span>{min.toFixed(0)}</span>
      </div>

      {/* Chart area */}
      <div className="ml-12 relative" style={{ height: chartHeight }}>
        {/* Grid lines */}
        <div className="absolute inset-0 flex flex-col justify-between">
          {[0, 1, 2].map(i => (
            <div key={i} className="border-t border-dark-600 w-full" />
          ))}
        </div>

        {/* Data points and lines */}
        <svg className="absolute inset-0 w-full h-full" viewBox={`0 0 ${entries.length * 60} ${chartHeight}`} preserveAspectRatio="none">
          {/* Line */}
          <polyline
            fill="none"
            stroke="var(--color-primary, #00ff88)"
            strokeWidth="2"
            points={entries.map((e, i) => {
              const x = i * 60 + 30;
              const y = chartHeight - ((Number(e.weight_kg) - min) / range) * (chartHeight - 10) - 5;
              return `${x},${y}`;
            }).join(' ')}
          />
          {/* Dots */}
          {entries.map((e, i) => {
            const x = i * 60 + 30;
            const y = chartHeight - ((Number(e.weight_kg) - min) / range) * (chartHeight - 10) - 5;
            return <circle key={i} cx={x} cy={y} r="4" fill="var(--color-primary, #00ff88)" />;
          })}
        </svg>
      </div>

      {/* X axis labels */}
      <div className="ml-12 flex justify-between mt-1">
        {entries.map((e, i) => (
          <span key={i} className="text-[9px] text-gray-500 text-center" style={{ width: 60 }}>
            {new Date(e.recorded_at).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}
          </span>
        ))}
      </div>
    </div>
  );
}

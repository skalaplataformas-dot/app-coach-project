'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { useToast } from '@/context/ToastContext';

const CATEGORIES = [
  { value: 'strength', label: 'Fuerza' },
  { value: 'cardio', label: 'Cardio' },
  { value: 'hiit', label: 'HIIT' },
  { value: 'flexibility', label: 'Flexibilidad' },
];

const DIFFICULTIES = [
  { value: 'beginner', label: 'Principiante' },
  { value: 'intermediate', label: 'Intermedio' },
  { value: 'advanced', label: 'Avanzado' },
];

const DIFF_COLORS = { beginner: 'text-green-400', intermediate: 'text-yellow-400', advanced: 'text-red-400' };

const EMPTY_EXERCISE = { name: '', sets: 3, reps: '12', rest_seconds: 60, notes: '', muscle_group: '' };

export default function AdminWorkoutsPage() {
  const toast = useToast();
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // null=list, 'new'=create, workoutId=edit
  const [form, setForm] = useState({ title: '', description: '', difficulty: 'intermediate', duration_minutes: 45, category: 'strength', exercises: [] });
  const [saving, setSaving] = useState(false);

  const loadWorkouts = () => {
    setLoading(true);
    apiFetch('/api/coach/workouts')
      .then(setWorkouts)
      .catch(() => toast.error('Error al cargar entrenamientos'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadWorkouts(); }, []);

  const startNew = () => {
    setForm({ title: '', description: '', difficulty: 'intermediate', duration_minutes: 45, category: 'strength', exercises: [{ ...EMPTY_EXERCISE }] });
    setEditing('new');
  };

  const startEdit = async (id) => {
    try {
      const data = await apiFetch(`/api/coach/workouts/${id}`);
      setForm({
        title: data.title,
        description: data.description || '',
        difficulty: data.difficulty,
        duration_minutes: data.duration_minutes,
        category: data.category,
        exercises: data.exercises?.length > 0 ? data.exercises.map(e => ({
          name: e.name, sets: e.sets, reps: e.reps, rest_seconds: e.rest_seconds,
          notes: e.notes || '', muscle_group: e.muscle_group || '',
        })) : [{ ...EMPTY_EXERCISE }],
      });
      setEditing(id);
    } catch {
      toast.error('Error al cargar entrenamiento');
    }
  };

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error('El título es requerido'); return; }
    if (form.exercises.length === 0 || !form.exercises[0].name.trim()) {
      toast.error('Agrega al menos un ejercicio'); return;
    }

    setSaving(true);
    try {
      const body = {
        ...form,
        exercises: form.exercises.filter(e => e.name.trim()).map((e, i) => ({ ...e, sort_order: i + 1 })),
      };

      if (editing === 'new') {
        await apiFetch('/api/coach/workouts', { method: 'POST', body });
        toast.success('Entrenamiento creado');
      } else {
        await apiFetch(`/api/coach/workouts/${editing}`, { method: 'PUT', body });
        toast.success('Entrenamiento actualizado');
      }
      setEditing(null);
      loadWorkouts();
    } catch (err) {
      toast.error(err.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este entrenamiento?')) return;
    try {
      await apiFetch(`/api/coach/workouts/${id}`, { method: 'DELETE' });
      toast.success('Entrenamiento eliminado');
      loadWorkouts();
    } catch {
      toast.error('Error al eliminar');
    }
  };

  const addExercise = () => setForm(f => ({ ...f, exercises: [...f.exercises, { ...EMPTY_EXERCISE }] }));
  const removeExercise = (i) => setForm(f => ({ ...f, exercises: f.exercises.filter((_, j) => j !== i) }));
  const updateExercise = (i, key, value) => setForm(f => ({
    ...f, exercises: f.exercises.map((e, j) => j === i ? { ...e, [key]: value } : e),
  }));
  const moveExercise = (i, dir) => {
    const newIdx = i + dir;
    if (newIdx < 0 || newIdx >= form.exercises.length) return;
    setForm(f => {
      const exs = [...f.exercises];
      [exs[i], exs[newIdx]] = [exs[newIdx], exs[i]];
      return { ...f, exercises: exs };
    });
  };

  // ─── Edit/Create View ─────────────────────────────────────────────
  if (editing !== null) {
    return (
      <div className="max-w-3xl mx-auto">
        <button onClick={() => setEditing(null)} className="flex items-center gap-2 text-gray-400 hover:text-white mb-4">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Volver
        </button>

        <h1 className="text-2xl font-bold mb-6">{editing === 'new' ? 'Crear Entrenamiento' : 'Editar Entrenamiento'}</h1>

        {/* Workout Info */}
        <div className="card mb-4">
          <h2 className="font-bold mb-3">Información General</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="text-xs text-gray-500 block mb-1">Título</label>
              <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                className="input-field w-full" placeholder="Ej: Push Day - Pecho y Tríceps" />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs text-gray-500 block mb-1">Descripción</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                className="input-field w-full" rows={2} placeholder="Descripción del entrenamiento" />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Categoría</label>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="input-field w-full">
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Dificultad</label>
              <select value={form.difficulty} onChange={e => setForm(f => ({ ...f, difficulty: e.target.value }))} className="input-field w-full">
                {DIFFICULTIES.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Duración (min)</label>
              <input type="number" value={form.duration_minutes} onChange={e => setForm(f => ({ ...f, duration_minutes: Number(e.target.value) }))}
                className="input-field w-full" min={5} max={180} />
            </div>
          </div>
        </div>

        {/* Exercises */}
        <div className="card mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold">Ejercicios ({form.exercises.length})</h2>
            <button onClick={addExercise} className="text-sm text-primary hover:underline">+ Agregar ejercicio</button>
          </div>

          <div className="space-y-3">
            {form.exercises.map((ex, i) => (
              <div key={i} className="bg-dark-700/50 rounded-xl p-3 relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-500 font-bold">#{i + 1}</span>
                  <div className="flex gap-1">
                    <button onClick={() => moveExercise(i, -1)} disabled={i === 0}
                      className="text-gray-500 hover:text-white disabled:opacity-30 text-xs">↑</button>
                    <button onClick={() => moveExercise(i, 1)} disabled={i === form.exercises.length - 1}
                      className="text-gray-500 hover:text-white disabled:opacity-30 text-xs">↓</button>
                    <button onClick={() => removeExercise(i)}
                      className="text-gray-500 hover:text-red-400 text-xs ml-2">✕</button>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <div className="col-span-2">
                    <input type="text" value={ex.name} onChange={e => updateExercise(i, 'name', e.target.value)}
                      className="input-field w-full text-sm" placeholder="Nombre del ejercicio" />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-600">Series</label>
                    <input type="number" value={ex.sets} onChange={e => updateExercise(i, 'sets', Number(e.target.value))}
                      className="input-field w-full text-sm" min={1} max={10} />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-600">Reps</label>
                    <input type="text" value={ex.reps} onChange={e => updateExercise(i, 'reps', e.target.value)}
                      className="input-field w-full text-sm" placeholder="12" />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-600">Descanso (s)</label>
                    <input type="number" value={ex.rest_seconds} onChange={e => updateExercise(i, 'rest_seconds', Number(e.target.value))}
                      className="input-field w-full text-sm" min={0} max={300} />
                  </div>
                  <div className="col-span-2 md:col-span-3">
                    <label className="text-[10px] text-gray-600">Notas</label>
                    <input type="text" value={ex.notes} onChange={e => updateExercise(i, 'notes', e.target.value)}
                      className="input-field w-full text-sm" placeholder="Instrucciones (opcional)" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Save */}
        <button onClick={handleSave} disabled={saving}
          className="btn-primary w-full py-3 text-lg disabled:opacity-50">
          {saving ? 'Guardando...' : editing === 'new' ? 'Crear Entrenamiento' : 'Guardar Cambios'}
        </button>
      </div>
    );
  }

  // ─── List View ────────────────────────────────────────────────────
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Entrenamientos</h1>
        <button onClick={startNew} className="btn-primary px-4 py-2 text-sm">+ Crear Entrenamiento</button>
      </div>

      {loading ? (
        <div className="text-gray-400 text-center py-12">Cargando...</div>
      ) : workouts.length === 0 ? (
        <div className="text-gray-400 text-center py-12">No hay entrenamientos creados</div>
      ) : (
        <div className="space-y-2">
          {workouts.map(w => (
            <div key={w.id} className="card p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold">{w.title}</h3>
                    <span className={`text-xs ${DIFF_COLORS[w.difficulty]}`}>{DIFFICULTIES.find(d => d.value === w.difficulty)?.label}</span>
                  </div>
                  <div className="flex gap-3 text-xs text-gray-500 mt-1">
                    <span>{CATEGORIES.find(c => c.value === w.category)?.label}</span>
                    <span>{w.duration_minutes} min</span>
                    <span>{w.exercise_count} ejercicios</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => startEdit(w.id)} className="text-sm text-primary hover:underline">Editar</button>
                  <button onClick={() => handleDelete(w.id)} className="text-sm text-red-400 hover:underline">Eliminar</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

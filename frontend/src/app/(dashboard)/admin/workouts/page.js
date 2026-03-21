'use client';

import { useEffect, useState, useRef } from 'react';
import { apiFetch } from '@/lib/api';
import { useToast } from '@/context/ToastContext';

const CATEGORIES = [
  { value: 'strength', label: 'Fuerza' },
  { value: 'cardio', label: 'Cardio' },
  { value: 'hiit', label: 'HIIT' },
  { value: 'flexibility', label: 'Flexibilidad' },
];

const MUSCLE_GROUPS = [
  { value: '', label: 'Seleccionar grupo muscular' },
  { value: 'pecho_triceps', label: 'Pecho y Triceps' },
  { value: 'pecho_hombros_triceps', label: 'Push (Pecho/Hombros/Triceps)' },
  { value: 'espalda_biceps', label: 'Espalda y Biceps' },
  { value: 'hombros', label: 'Hombros' },
  { value: 'piernas', label: 'Piernas' },
  { value: 'abdominales', label: 'Abdominales' },
  { value: 'full_body', label: 'Full Body' },
  { value: 'cardio', label: 'Cardio / HIIT' },
  { value: 'flexibilidad', label: 'Flexibilidad' },
];

const EXERCISE_MUSCLE_GROUPS = [
  { value: '', label: 'General' },
  { value: 'chest', label: 'Pecho' },
  { value: 'back', label: 'Espalda' },
  { value: 'shoulders', label: 'Hombros' },
  { value: 'arms', label: 'Brazos' },
  { value: 'legs', label: 'Piernas' },
  { value: 'core', label: 'Abdominales' },
  { value: 'cardio', label: 'Cardio' },
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
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', difficulty: 'intermediate', duration_minutes: 45, category: 'strength', muscle_group: '', exercises: [] });
  const [saving, setSaving] = useState(false);
  const [exerciseLibrary, setExerciseLibrary] = useState([]);
  const [filterGroup, setFilterGroup] = useState('');

  const loadWorkouts = () => {
    setLoading(true);
    apiFetch('/api/coach/workouts')
      .then(setWorkouts)
      .catch(() => toast.error('Error al cargar entrenamientos'))
      .finally(() => setLoading(false));
  };

  const loadLibrary = () => {
    apiFetch('/api/coach/exercises')
      .then(setExerciseLibrary)
      .catch(() => {});
  };

  useEffect(() => { loadWorkouts(); loadLibrary(); }, []);

  const startNew = () => {
    setForm({ title: '', description: '', difficulty: 'intermediate', duration_minutes: 45, category: 'strength', muscle_group: '', exercises: [] });
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
        muscle_group: data.muscle_group || '',
        exercises: data.exercises?.length > 0 ? data.exercises.map(e => ({
          name: e.name, sets: e.sets, reps: e.reps, rest_seconds: e.rest_seconds,
          notes: e.notes || '', muscle_group: e.muscle_group || '',
        })) : [],
      });
      setEditing(id);
    } catch {
      toast.error('Error al cargar entrenamiento');
    }
  };

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error('El titulo es requerido'); return; }
    if (form.exercises.length === 0) {
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
      loadLibrary();
    } catch (err) {
      toast.error(err.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Eliminar este entrenamiento?')) return;
    try {
      await apiFetch(`/api/coach/workouts/${id}`, { method: 'DELETE' });
      toast.success('Entrenamiento eliminado');
      loadWorkouts();
    } catch {
      toast.error('Error al eliminar');
    }
  };

  const addExerciseFromLibrary = (libEx) => {
    setForm(f => ({
      ...f,
      exercises: [...f.exercises, {
        name: libEx.name,
        sets: libEx.sets || 3,
        reps: libEx.reps || '12',
        rest_seconds: libEx.rest_seconds || 60,
        notes: libEx.notes || '',
        muscle_group: libEx.muscle_group || '',
      }],
    }));
  };

  const addCustomExercise = () => {
    setForm(f => ({ ...f, exercises: [...f.exercises, { ...EMPTY_EXERCISE }] }));
  };

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

  // Filter library by muscle group
  const filteredLibrary = filterGroup
    ? exerciseLibrary.filter(ex => ex.muscle_group === filterGroup)
    : exerciseLibrary;

  // Check if exercise is already added
  const isAdded = (name) => form.exercises.some(e => e.name.toLowerCase() === name.toLowerCase());

  // ─── Edit/Create View ─────────────────────────────────────────────
  if (editing !== null) {
    return (
      <div className="max-w-4xl mx-auto">
        <button onClick={() => setEditing(null)} className="flex items-center gap-2 text-gray-400 hover:text-white mb-4">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Volver
        </button>

        <h1 className="text-2xl font-bold mb-6">{editing === 'new' ? 'Crear Entrenamiento' : 'Editar Entrenamiento'}</h1>

        {/* Workout Info */}
        <div className="card mb-4">
          <h2 className="font-bold mb-3">Informacion General</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="text-xs text-gray-500 block mb-1">Titulo</label>
              <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                className="input-field w-full" placeholder="Ej: Push Day - Pecho y Triceps" />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs text-gray-500 block mb-1">Descripcion</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                className="input-field w-full" rows={2} placeholder="Descripcion del entrenamiento" />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Categoria</label>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="input-field w-full">
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Grupo Muscular</label>
              <select value={form.muscle_group} onChange={e => setForm(f => ({ ...f, muscle_group: e.target.value }))} className="input-field w-full">
                {MUSCLE_GROUPS.map(mg => <option key={mg.value} value={mg.value}>{mg.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Dificultad</label>
              <select value={form.difficulty} onChange={e => setForm(f => ({ ...f, difficulty: e.target.value }))} className="input-field w-full">
                {DIFFICULTIES.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Duracion (min)</label>
              <input type="number" value={form.duration_minutes} onChange={e => setForm(f => ({ ...f, duration_minutes: Number(e.target.value) }))}
                className="input-field w-full" min={5} max={180} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Left: Exercise Library */}
          <div className="card">
            <h2 className="font-bold mb-3">Biblioteca de Ejercicios</h2>
            <p className="text-xs text-gray-500 mb-3">Selecciona ejercicios para agregar al entrenamiento</p>

            {/* Filter by muscle group */}
            <div className="flex flex-wrap gap-1 mb-3">
              <button
                onClick={() => setFilterGroup('')}
                className={`text-[10px] px-2 py-1 rounded-lg transition-colors ${
                  !filterGroup ? 'bg-primary text-dark-900 font-bold' : 'bg-dark-600 text-gray-400 hover:text-white'
                }`}
              >
                Todos
              </button>
              {EXERCISE_MUSCLE_GROUPS.filter(g => g.value).map(g => (
                <button
                  key={g.value}
                  onClick={() => setFilterGroup(g.value)}
                  className={`text-[10px] px-2 py-1 rounded-lg transition-colors ${
                    filterGroup === g.value ? 'bg-primary text-dark-900 font-bold' : 'bg-dark-600 text-gray-400 hover:text-white'
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>

            {/* Exercise list */}
            <div className="max-h-[400px] overflow-y-auto space-y-1 pr-1">
              {filteredLibrary.length === 0 ? (
                <p className="text-xs text-gray-600 text-center py-4">
                  {exerciseLibrary.length === 0
                    ? 'No hay ejercicios en la biblioteca. Crea ejercicios nuevos abajo.'
                    : 'No hay ejercicios en este grupo muscular.'}
                </p>
              ) : (
                filteredLibrary.map((ex, i) => {
                  const added = isAdded(ex.name);
                  const mgLabel = EXERCISE_MUSCLE_GROUPS.find(g => g.value === ex.muscle_group)?.label || '';
                  return (
                    <button
                      key={i}
                      onClick={() => !added && addExerciseFromLibrary(ex)}
                      disabled={added}
                      className={`w-full text-left p-2 rounded-lg flex items-center justify-between transition-colors ${
                        added ? 'bg-primary/5 opacity-50 cursor-not-allowed' : 'bg-dark-700/50 hover:bg-dark-600'
                      }`}
                    >
                      <div>
                        <span className="text-sm font-medium">{ex.name}</span>
                        <div className="flex gap-2 mt-0.5">
                          {mgLabel && <span className="text-[10px] text-primary">{mgLabel}</span>}
                          <span className="text-[10px] text-gray-500">{ex.sets}x{ex.reps} | {ex.rest_seconds}s</span>
                        </div>
                      </div>
                      {added ? (
                        <span className="text-[10px] text-primary">Agregado</span>
                      ) : (
                        <svg className="w-4 h-4 text-primary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                      )}
                    </button>
                  );
                })
              )}
            </div>

            {/* Add custom exercise */}
            <button
              onClick={addCustomExercise}
              className="w-full mt-3 py-2 border border-dashed border-dark-500 rounded-lg text-sm text-gray-400 hover:text-primary hover:border-primary/50 transition-colors"
            >
              + Crear ejercicio nuevo
            </button>
          </div>

          {/* Right: Selected Exercises */}
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold">Ejercicios del Entrenamiento ({form.exercises.length})</h2>
            </div>

            {form.exercises.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <svg className="w-8 h-8 mx-auto mb-2 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
                <p className="text-xs">Selecciona ejercicios de la biblioteca o crea nuevos</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                {form.exercises.map((ex, i) => (
                  <div key={i} className="bg-dark-700/50 rounded-xl p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-500 font-bold">#{i + 1}</span>
                      <div className="flex gap-1">
                        <button onClick={() => moveExercise(i, -1)} disabled={i === 0}
                          className="text-gray-500 hover:text-white disabled:opacity-30 text-xs px-1">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" /></svg>
                        </button>
                        <button onClick={() => moveExercise(i, 1)} disabled={i === form.exercises.length - 1}
                          className="text-gray-500 hover:text-white disabled:opacity-30 text-xs px-1">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                        </button>
                        <button onClick={() => removeExercise(i)}
                          className="text-gray-500 hover:text-red-400 text-xs ml-1 px-1">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </div>
                    </div>

                    {/* Exercise name - editable for custom, read-only for library */}
                    <input type="text" value={ex.name} onChange={e => updateExercise(i, 'name', e.target.value)}
                      className="input-field w-full text-sm font-medium mb-2" placeholder="Nombre del ejercicio" />

                    <div className="grid grid-cols-3 gap-2 mb-2">
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
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-gray-600">Grupo muscular</label>
                        <select value={ex.muscle_group} onChange={e => updateExercise(i, 'muscle_group', e.target.value)}
                          className="input-field w-full text-sm">
                          {EXERCISE_MUSCLE_GROUPS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] text-gray-600">Notas</label>
                        <input type="text" value={ex.notes} onChange={e => updateExercise(i, 'notes', e.target.value)}
                          className="input-field w-full text-sm" placeholder="Instrucciones" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Save */}
        <button onClick={handleSave} disabled={saving}
          className="btn-primary w-full py-3 text-lg mt-4 disabled:opacity-50">
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
                    {w.muscle_group && <span className="text-primary">{MUSCLE_GROUPS.find(mg => mg.value === w.muscle_group)?.label || w.muscle_group}</span>}
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

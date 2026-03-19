'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { TOASTS, CONFIRMATIONS } from '@/config/coach-voice';

const CATEGORIES = ['Proteinas', 'Carbohidratos', 'Frutas', 'Grasas', 'Empacados'];

const emptyFood = {
  name: '', category: 'Proteinas', serving_size: '', serving_unit: 'gr',
  calories: '', protein_g: '', carbs_g: '', fat_g: '',
  sodium_mg: '', fiber_g: '', sugar_g: '',
};

export default function AdminFoodsPage() {
  const toast = useToast();
  const [foods, setFoods] = useState([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // food object or 'new'
  const [form, setForm] = useState(emptyFood);
  const [saving, setSaving] = useState(false);

  const loadFoods = () => {
    const params = filter !== 'all' ? `?category=${filter}` : '';
    apiFetch(`/api/foods${params}`)
      .then(setFoods)
      .catch(() => setFoods([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadFoods(); }, [filter]);

  const filtered = search
    ? foods.filter(f => f.name.toLowerCase().includes(search.toLowerCase()))
    : foods;

  const startNew = () => {
    setForm(emptyFood);
    setEditing('new');
  };

  const startEdit = (food) => {
    setForm({ ...food });
    setEditing(food.id);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editing === 'new') {
        await apiFetch('/api/foods', { method: 'POST', body: form });
      } else {
        await apiFetch(`/api/foods/${editing}`, { method: 'PUT', body: form });
      }
      setEditing(null);
      loadFoods();
      toast.success(editing === 'new' ? TOASTS.food_created : TOASTS.food_updated);
    } catch (e) {
      toast.error(e.message);
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm(CONFIRMATIONS.delete_food)) return;
    try {
      await apiFetch(`/api/foods/${id}`, { method: 'DELETE' });
      loadFoods();
      toast.success(TOASTS.food_deleted);
    } catch (e) {
      toast.error(e.message);
    }
  };

  const updateForm = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Gestión de Alimentos</h1>
        <button onClick={startNew} className="btn-primary text-sm">+ Agregar</button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <input
          type="text" placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)}
          className="input-field max-w-xs"
        />
        <select value={filter} onChange={e => { setFilter(e.target.value); setLoading(true); }} className="input-field max-w-[200px]">
          <option value="all">Todas las categorias</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Edit Modal */}
      {editing && (
        <div className="card mb-6 border-primary">
          <h3 className="font-bold mb-4">{editing === 'new' ? 'Nuevo Alimento' : 'Editar Alimento'}</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className="col-span-2 md:col-span-1">
              <label className="input-label">Nombre</label>
              <input className="input-field" value={form.name} onChange={e => updateForm('name', e.target.value)} />
            </div>
            <div>
              <label className="input-label">Categoria</label>
              <select className="input-field" value={form.category} onChange={e => updateForm('category', e.target.value)}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="input-label">Porcion</label>
              <input className="input-field" value={form.serving_size} onChange={e => updateForm('serving_size', e.target.value)} />
            </div>
            <div>
              <label className="input-label">Unidad</label>
              <input className="input-field" value={form.serving_unit} onChange={e => updateForm('serving_unit', e.target.value)} />
            </div>
            <div>
              <label className="input-label">Calorias</label>
              <input type="number" className="input-field" value={form.calories} onChange={e => updateForm('calories', Number(e.target.value))} />
            </div>
            <div>
              <label className="input-label">Proteina (g)</label>
              <input type="number" step="0.1" className="input-field" value={form.protein_g} onChange={e => updateForm('protein_g', Number(e.target.value))} />
            </div>
            <div>
              <label className="input-label">Carbs (g)</label>
              <input type="number" step="0.1" className="input-field" value={form.carbs_g} onChange={e => updateForm('carbs_g', Number(e.target.value))} />
            </div>
            <div>
              <label className="input-label">Grasa (g)</label>
              <input type="number" step="0.1" className="input-field" value={form.fat_g} onChange={e => updateForm('fat_g', Number(e.target.value))} />
            </div>
            <div>
              <label className="input-label">Sodio (mg)</label>
              <input type="number" step="0.1" className="input-field" value={form.sodium_mg} onChange={e => updateForm('sodium_mg', Number(e.target.value))} />
            </div>
            <div>
              <label className="input-label">Fibra (g)</label>
              <input type="number" step="0.1" className="input-field" value={form.fiber_g} onChange={e => updateForm('fiber_g', Number(e.target.value))} />
            </div>
            <div>
              <label className="input-label">Azucar (g)</label>
              <input type="number" step="0.1" className="input-field" value={form.sugar_g} onChange={e => updateForm('sugar_g', Number(e.target.value))} />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={handleSave} disabled={saving} className="btn-primary text-sm disabled:opacity-50">
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
            <button onClick={() => setEditing(null)} className="btn-secondary text-sm">Cancelar</button>
          </div>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="text-gray-400 text-center py-8">Cargando...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 border-b border-dark-500">
                <th className="text-left py-2">Nombre</th>
                <th className="text-left py-2">Categoria</th>
                <th className="text-right py-2">Porcion</th>
                <th className="text-right py-2">Cal</th>
                <th className="text-right py-2">Prot</th>
                <th className="text-right py-2">Carbs</th>
                <th className="text-right py-2">Grasa</th>
                <th className="text-right py-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(food => (
                <tr key={food.id} className="border-b border-dark-600 hover:bg-dark-700">
                  <td className="py-2 font-medium">{food.name}</td>
                  <td className="py-2 text-gray-400">{food.category}</td>
                  <td className="py-2 text-right">{food.serving_size} {food.serving_unit}</td>
                  <td className="py-2 text-right">{food.calories}</td>
                  <td className="py-2 text-right">{food.protein_g}</td>
                  <td className="py-2 text-right">{food.carbs_g}</td>
                  <td className="py-2 text-right">{food.fat_g}</td>
                  <td className="py-2 text-right">
                    <button onClick={() => startEdit(food)} className="text-primary hover:underline mr-2">Editar</button>
                    <button onClick={() => handleDelete(food.id)} className="text-red-400 hover:underline">Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="text-xs text-gray-500 mt-2">{filtered.length} alimentos</div>
        </div>
      )}
    </div>
  );
}

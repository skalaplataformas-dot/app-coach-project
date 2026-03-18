'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

const SECTION_ICONS_MAP = {
  User: 'Informacion Personal',
  Ruler: 'Medidas',
  Camera: 'Fotos',
  Heart: 'Salud',
  Coffee: 'Habitos',
  Settings: 'Preferencias',
};

export default function AdminOnboardingPage() {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);

  const load = () => {
    apiFetch('/api/onboarding/admin/sections')
      .then(setSections)
      .catch(() => setSections([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const toggleSection = async (section) => {
    setSaving(section.id);
    try {
      await apiFetch(`/api/onboarding/admin/sections/${section.id}`, {
        method: 'PUT',
        body: { enabled: !section.enabled },
      });
      load();
    } catch (e) {
      alert(e.message);
    }
    setSaving(null);
  };

  const toggleRequired = async (section) => {
    setSaving(section.id);
    try {
      await apiFetch(`/api/onboarding/admin/sections/${section.id}`, {
        method: 'PUT',
        body: { required: !section.required },
      });
      load();
    } catch (e) {
      alert(e.message);
    }
    setSaving(null);
  };

  const moveSection = async (index, direction) => {
    const newSections = [...sections];
    const swapIdx = direction === 'up' ? index - 1 : index + 1;
    if (swapIdx < 0 || swapIdx >= newSections.length) return;

    const tempOrder = newSections[index].sort_order;
    newSections[index].sort_order = newSections[swapIdx].sort_order;
    newSections[swapIdx].sort_order = tempOrder;

    setSaving('reorder');
    try {
      await apiFetch('/api/onboarding/admin/sections-reorder', {
        method: 'PUT',
        body: {
          sections: newSections.map(s => ({ id: s.id, sort_order: s.sort_order })),
        },
      });
      load();
    } catch (e) {
      alert(e.message);
    }
    setSaving(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Cargando configuracion...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Secciones del Onboarding</h1>
          <p className="text-sm text-gray-400 mt-1">
            Activa, desactiva y reordena las secciones que ven los usuarios al registrarse
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {sections.map((section, index) => (
          <div key={section.id}
            className={`card flex items-center gap-4 transition-all ${
              !section.enabled ? 'opacity-50' : ''
            } ${saving === section.id ? 'animate-pulse' : ''}`}>
            {/* Drag handle / order */}
            <div className="flex flex-col gap-1">
              <button
                onClick={() => moveSection(index, 'up')}
                disabled={index === 0 || saving === 'reorder'}
                className="text-gray-500 hover:text-white disabled:opacity-20 text-xs">
                &#9650;
              </button>
              <span className="text-xs text-gray-600 text-center">{section.sort_order}</span>
              <button
                onClick={() => moveSection(index, 'down')}
                disabled={index === sections.length - 1 || saving === 'reorder'}
                className="text-gray-500 hover:text-white disabled:opacity-20 text-xs">
                &#9660;
              </button>
            </div>

            {/* Section info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white">{section.title}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-dark-600 text-gray-400">{section.key}</span>
              </div>
              <p className="text-sm text-gray-400 mt-0.5 truncate">{section.description}</p>
            </div>

            {/* Required toggle */}
            <div className="flex flex-col items-center gap-1">
              <span className="text-[10px] text-gray-500 uppercase">Requerida</span>
              <button
                onClick={() => toggleRequired(section)}
                disabled={saving === section.id}
                className={`w-10 h-6 rounded-full transition-colors relative ${
                  section.required ? 'bg-cyan-500' : 'bg-dark-500'
                }`}>
                <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                  section.required ? 'translate-x-5' : 'translate-x-1'
                }`} />
              </button>
            </div>

            {/* Enabled toggle */}
            <div className="flex flex-col items-center gap-1">
              <span className="text-[10px] text-gray-500 uppercase">Activa</span>
              <button
                onClick={() => toggleSection(section)}
                disabled={saving === section.id}
                className={`w-10 h-6 rounded-full transition-colors relative ${
                  section.enabled ? 'bg-primary' : 'bg-dark-500'
                }`}>
                <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                  section.enabled ? 'translate-x-5' : 'translate-x-1'
                }`} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {sections.length === 0 && (
        <div className="text-center text-gray-500 py-12">
          No hay secciones configuradas. Ejecuta la migracion SQL para crear las secciones por defecto.
        </div>
      )}

      <div className="mt-8 card border-dark-500">
        <h3 className="font-bold text-sm text-gray-400 uppercase mb-2">Como funciona</h3>
        <ul className="text-sm text-gray-400 space-y-1">
          <li>- Las secciones <span className="text-white">activas</span> aparecen en el onboarding del usuario</li>
          <li>- Las secciones <span className="text-white">requeridas</span> no se pueden saltar</li>
          <li>- Usa las flechas para cambiar el orden en que aparecen</li>
          <li>- Los cambios se aplican inmediatamente para nuevos registros</li>
        </ul>
      </div>
    </div>
  );
}

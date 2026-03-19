'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { TOASTS, CONFIRMATIONS } from '@/config/coach-voice';

export default function AdminFeedPage() {
  const toast = useToast();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [pinned, setPinned] = useState(false);
  const [sending, setSending] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const fetchMessages = () => {
    apiFetch('/api/messages')
      .then(setMessages)
      .catch(() => toast.error(TOASTS.error_messages))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchMessages(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    setSending(true);
    try {
      if (editingId) {
        await apiFetch(`/api/messages/${editingId}`, {
          method: 'PUT',
          body: { title: title || null, content, pinned },
        });
        toast.success(TOASTS.message_updated);
      } else {
        await apiFetch('/api/messages', {
          method: 'POST',
          body: { title: title || null, content, pinned },
        });
        toast.success(TOASTS.message_published);
      }
      setTitle('');
      setContent('');
      setPinned(false);
      setEditingId(null);
      fetchMessages();
    } catch {
      toast.error(TOASTS.error_message_save);
    } finally {
      setSending(false);
    }
  };

  const handleEdit = (msg) => {
    setEditingId(msg.id);
    setTitle(msg.title || '');
    setContent(msg.content);
    setPinned(msg.pinned);
    window.scrollTo(0, 0);
  };

  const handleDelete = async (id) => {
    if (!confirm(CONFIRMATIONS.delete_message)) return;
    try {
      await apiFetch(`/api/messages/${id}`, { method: 'DELETE' });
      toast.success(TOASTS.message_deleted);
      fetchMessages();
    } catch {
      toast.error(TOASTS.error_message_delete);
    }
  };

  const handleTogglePin = async (msg) => {
    try {
      await apiFetch(`/api/messages/${msg.id}`, {
        method: 'PUT',
        body: { pinned: !msg.pinned },
      });
      fetchMessages();
    } catch {
      toast.error(TOASTS.error_message_update);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setTitle('');
    setContent('');
    setPinned(false);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Gestión de Mensajes</h1>

      {/* Form */}
      <form onSubmit={handleSubmit} className="card mb-8 space-y-4">
        <h2 className="text-lg font-bold">
          {editingId ? 'Editar mensaje' : 'Nuevo mensaje'}
        </h2>

        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Título (opcional)"
          className="input-field w-full"
        />

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Escribe tu mensaje aquí..."
          className="input-field w-full resize-none h-32"
          required
        />

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={pinned}
              onChange={(e) => setPinned(e.target.checked)}
              className="w-4 h-4 rounded border-dark-500 bg-dark-700 text-primary focus:ring-primary"
            />
            <span className="text-sm text-gray-300">Fijar mensaje arriba</span>
          </label>

          <div className="flex gap-2">
            {editingId && (
              <button type="button" onClick={cancelEdit}
                className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">
                Cancelar
              </button>
            )}
            <button type="submit" disabled={sending || !content.trim()}
              className="btn-primary px-6 py-2 text-sm disabled:opacity-50">
              {sending ? 'Enviando...' : editingId ? 'Actualizar' : 'Publicar'}
            </button>
          </div>
        </div>
      </form>

      {/* Messages list */}
      <h2 className="text-lg font-bold mb-4">
        Mensajes publicados ({messages.length})
      </h2>

      {loading ? (
        <div className="text-gray-400 text-center py-8">Cargando...</div>
      ) : messages.length === 0 ? (
        <div className="text-gray-400 text-center py-8">No hay mensajes publicados</div>
      ) : (
        <div className="space-y-3">
          {messages.map(msg => (
            <div key={msg.id} className={`card ${msg.pinned ? 'border-primary/30' : ''}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {msg.pinned && (
                      <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                        Fijado
                      </span>
                    )}
                    {msg.title && <h3 className="font-bold text-sm truncate">{msg.title}</h3>}
                  </div>
                  <p className="text-sm text-gray-300 line-clamp-2">{msg.content}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(msg.created_at).toLocaleDateString('es-CO', {
                      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
                    })}
                  </p>
                </div>

                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={() => handleTogglePin(msg)}
                    className={`p-2 rounded-lg transition-colors ${msg.pinned ? 'text-primary bg-primary/10' : 'text-gray-500 hover:text-white hover:bg-dark-600'}`}
                    title={msg.pinned ? 'Desfijar' : 'Fijar'}>
                    <svg className="w-4 h-4" fill={msg.pinned ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                  </button>
                  <button onClick={() => handleEdit(msg)}
                    className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-dark-600 transition-colors"
                    title="Editar">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button onClick={() => handleDelete(msg.id)}
                    className="p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                    title="Eliminar">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

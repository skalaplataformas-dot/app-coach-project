'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { TOASTS } from '@/config/coach-voice';

function timeAgo(dateStr) {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now - date;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'Ahora';
  if (mins < 60) return `Hace ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `Hace ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Ayer';
  if (days < 7) return `Hace ${days} días`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `Hace ${weeks} semana${weeks > 1 ? 's' : ''}`;
  return date.toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function FeedPage() {
  const toast = useToast();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/api/messages')
      .then(setMessages)
      .catch(() => { toast.error(TOASTS.error_messages); setMessages([]); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-gray-400 text-center py-12">Cargando mensajes...</div>;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Muro</h1>

      {messages.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 rounded-full bg-dark-600 flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold mb-2">Sin mensajes aún</h2>
          <p className="text-gray-400 text-sm">Tu coach publicará mensajes y anuncios aquí.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map(msg => (
            <MessageCard key={msg.id} message={msg} />
          ))}
        </div>
      )}
    </div>
  );
}

function MessageCard({ message }) {
  const isPinned = message.pinned;

  return (
    <div className={`rounded-2xl border-l-4 ${
      isPinned ? 'border-l-primary bg-primary/5 border border-primary/10' : 'border-l-dark-500 bg-dark-800 border border-dark-500'
    } p-5`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-primary font-bold text-sm">
            {(message.author_name || 'C').charAt(0)}
          </div>
          <div>
            <p className="text-sm font-medium text-white">{message.author_name || 'FitBro Coach'}</p>
            <p className="text-xs text-gray-500">{timeAgo(message.created_at)}</p>
          </div>
        </div>
        {isPinned && (
          <span className="text-[10px] font-bold uppercase px-2 py-1 rounded-lg bg-primary/10 text-primary">
            Fijado
          </span>
        )}
      </div>

      {/* Content */}
      {message.title && (
        <h3 className="font-bold text-lg mb-2 text-white">{message.title}</h3>
      )}
      <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">{message.content}</p>
    </div>
  );
}

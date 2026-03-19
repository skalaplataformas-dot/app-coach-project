'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientSupabase } from '@/lib/supabase/client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const supabase = createClientSupabase();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message === 'Invalid login credentials'
        ? 'Credenciales incorrectas'
        : authError.message);
      setLoading(false);
      return;
    }

    router.push('/dashboard');
    router.refresh();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-2"><span className="text-primary">Fit</span>Bro</h1>
        <p className="text-gray-400 text-center mb-8">Inicia sesión en tu cuenta</p>

        <form onSubmit={handleLogin} className="card space-y-4">
          {error && (
            <div className="bg-red-900/30 border border-red-500 text-red-300 rounded-xl px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="input-label">Email</label>
            <input
              type="email"
              className="input-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
            />
          </div>

          <div>
            <label className="input-label">Contraseña</label>
            <input
              type="password"
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
            {loading ? 'Cargando...' : 'Iniciar Sesión'}
          </button>
        </form>

        <p className="text-center text-gray-400 mt-6">
          No tienes cuenta?{' '}
          <a href="/register" className="text-primary hover:underline">
            Registrate
          </a>
        </p>
      </div>
    </div>
  );
}

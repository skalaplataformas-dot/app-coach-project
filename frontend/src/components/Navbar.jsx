'use client';

import { useRouter, usePathname } from 'next/navigation';
import { createClientSupabase } from '@/lib/supabase/client';
import { useUser } from '@/hooks/useUser';

const PAGE_NAMES = {
  '/dashboard': 'Dashboard',
  '/calculator': 'Calculadora Metabólica',
  '/nutrition': 'Plan Nutricional',
  '/workouts': 'Entrenamientos',
  '/feed': 'Muro',
  '/profile': 'Mi Perfil',
  '/admin/coach': 'Asesorados',
  '/admin/feed': 'Gestión de Mensajes',
  '/admin/foods': 'Gestión de Alimentos',
  '/admin/workouts': 'Gestión de Entrenamientos',
  '/admin/system': 'Panel de Sistema',
  '/admin/onboarding': 'Configuración de Onboarding',
};

function getInitials(name) {
  if (!name) return '?';
  return name.charAt(0).toUpperCase();
}

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading } = useUser();

  const pageName = PAGE_NAMES[pathname] || '';
  const isAdmin = user?.role === 'admin';

  const handleLogout = async () => {
    const supabase = createClientSupabase();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <header className="h-16 border-b border-dark-500 flex items-center justify-between px-4 md:px-6 bg-dark-800 relative">
      {/* Bottom glow effect */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

      {/* Left side: Mobile title + Desktop breadcrumb */}
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-bold md:hidden">
          <span className="text-primary">Fit</span>Bro
        </h1>

        {/* Breadcrumb - desktop only */}
        {pageName && (
          <div className="hidden md:flex items-center gap-2 text-sm">
            <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4" />
            </svg>
            <span className="text-gray-500">/</span>
            <span className="text-white font-medium">{pageName}</span>
          </div>
        )}
      </div>

      {/* Right side: User info + Logout */}
      <div className="flex items-center gap-3">
        {!loading && user && (
          <div className="flex items-center gap-2.5">
            {/* Avatar circle */}
            <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-primary font-bold text-sm">
              {getInitials(user.full_name)}
            </div>

            {/* Name + role - hidden on small mobile */}
            <div className="hidden sm:flex flex-col">
              <span className="text-sm font-medium text-white leading-tight">
                {user.full_name || 'Usuario'}
              </span>
              <div className="flex items-center gap-1.5">
                {isAdmin ? (
                  <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-primary/15 text-primary leading-none">
                    Admin
                  </span>
                ) : (
                  <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-dark-500 text-gray-400 leading-none">
                    Usuario
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Divider */}
        <div className="w-px h-6 bg-dark-500" />

        {/* Logout button */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-red-400 transition-colors px-2 py-1.5 rounded-lg hover:bg-dark-700"
          title="Cerrar sesión"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span className="hidden md:inline">Salir</span>
        </button>
      </div>
    </header>
  );
}

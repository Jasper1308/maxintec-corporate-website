'use client';

import { LogOut } from 'lucide-react';

import { useAuth } from '@/features/auth/AuthProvider';

export default function PortalHeader() {
  const {
    profile,
    user,
    isAdmin,
    isManager,
    signOut,
  } = useAuth();

  const role = isAdmin
    ? 'Administrador'
    : isManager
      ? 'Síndico'
      : 'Morador';

  return (
    <header className="flex h-20 items-center justify-between border-b border-white/10 bg-slate-950/70 px-6 backdrop-blur-xl">
      <div>
        <p className="text-sm font-medium text-white">
          {profile?.full_name ??
            user?.email}
        </p>

        <p className="mt-1 text-xs text-slate-400">
          {role}
        </p>
      </div>

      <button
        onClick={signOut}
        className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/5 hover:text-white"
      >
        <LogOut className="h-4 w-4" />
        Sair
      </button>
    </header>
  );
}
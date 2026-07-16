'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function ClientEntryPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      router.replace(user ? '/tools' : '/login');
    }
  }, [loading, user, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white">
      <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-8 shadow-2xl shadow-slate-950/40 backdrop-blur-xl">
        <p className="text-lg font-medium">Redirecionando para a Área do Cliente...</p>
      </div>
    </div>
  );
}

'use client';

import { useAuth, AuthProvider } from '@/hooks/useAuth';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const publicPages = ['/login', '/signup', '/forgot-password', '/reset-password', '/accept-invite', '/privacy-policy'];
  const isPublicPage = publicPages.includes(pathname);
  const isEntryPage = pathname === '/login' || pathname === '/signup';

  useEffect(() => {
    if (!loading && !user && !isPublicPage) {
      router.push('/login');
    }
    if (!loading && user && isEntryPage) {
      router.replace('/portal');
    }
  }, [user, loading, router, isPublicPage, isEntryPage]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950">
        <div className="text-white">Carregando...</div>
      </div>
    );
  }

  if (isPublicPage) {
    return <>{children}</>;
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <AuthGuard>
        <div className="client-dashboard-layout">
          {children}
        </div>
      </AuthGuard>
    </AuthProvider>
  );
}

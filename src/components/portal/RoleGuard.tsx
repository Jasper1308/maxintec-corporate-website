'use client';

import type { ReactNode } from 'react';

import { useAuth } from '@/features/auth/AuthProvider';

type RequiredRole =
  | 'admin'
  | 'manager'
  | 'resident';

interface RoleGuardProps {
  role: RequiredRole;
  children: ReactNode;
  fallback?: ReactNode;
}

export function RoleGuard({
  role,
  children,
  fallback = null,
}: RoleGuardProps) {
  const {
    isAdmin,
    isManager,
    isResident,
  } = useAuth();

  const allowed =
    role === 'admin'
      ? isAdmin
      : role === 'manager'
        ? isManager
        : isResident;

  if (!allowed) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
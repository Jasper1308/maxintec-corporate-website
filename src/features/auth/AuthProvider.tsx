'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { useRouter } from 'next/navigation';

import type { User } from '@supabase/supabase-js';

import { supabase } from '@/lib/supabase/client';

import {
  getMemberships,
  getProfile,
} from './queries';

import type {
  Membership,
  Profile,
} from './types';

interface AuthContextValue {
  user: User | null;
  profile: Profile | null;
  memberships: Membership[];

  loading: boolean;

  isAdmin: boolean;
  isManager: boolean;
  isResident: boolean;

  refreshIdentity: () => Promise<void>;

  signUp: (
    email: string,
    password: string
  ) => Promise<{ error: string | null }>;

  signIn: (
    email: string,
    password: string
  ) => Promise<{ error: string | null }>;

  signOut: () => Promise<void>;
}

const AuthContext =
  createContext<AuthContextValue | null>(null);

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();

  const [user, setUser] =
    useState<User | null>(null);

  const [profile, setProfile] =
    useState<Profile | null>(null);

  const [memberships, setMemberships] =
    useState<Membership[]>([]);

  const [loading, setLoading] =
    useState(true);

  const loadIdentity = useCallback(
    async (currentUser: User | null) => {
      setUser(currentUser);

      if (!currentUser) {
        setProfile(null);
        setMemberships([]);
        return;
      }

      const [
        currentProfile,
        currentMemberships,
      ] = await Promise.all([
        getProfile(currentUser.id),
        getMemberships(currentUser.id),
      ]);

      setProfile(currentProfile);
      setMemberships(currentMemberships);
    },
    []
  );

  const refreshIdentity =
    useCallback(async () => {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      await loadIdentity(currentUser);
    }, [loadIdentity]);

  useEffect(() => {
    let mounted = true;

    async function initialize() {
      try {
        const {
          data: { user: currentUser },
        } = await supabase.auth.getUser();

        if (!mounted) return;

        await loadIdentity(currentUser);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    initialize();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!mounted) return;

        setLoading(true);

        try {
          await loadIdentity(
            session?.user ?? null
          );
        } finally {
          if (mounted) {
            setLoading(false);
          }
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [loadIdentity]);

  const signUp = useCallback(
    async (
      email: string,
      password: string
    ) => {
      const { error } =
        await supabase.auth.signUp({
          email,
          password,
        });

      return {
        error: error?.message ?? null,
      };
    },
    []
  );

  const signIn = useCallback(
    async (
      email: string,
      password: string
    ) => {
      const { error } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (error) {
        return {
          error: error.message,
        };
      }

      router.replace('/portal');

      return {
        error: null,
      };
    },
    [router]
  );

  const signOut =
    useCallback(async () => {
      await supabase.auth.signOut();

      router.replace('/login');
      router.refresh();
    }, [router]);

  const isAdmin =
    profile?.global_role === 'admin';

  const approvedMemberships =
    useMemo(
      () =>
        memberships.filter(
          membership =>
            membership.status ===
            'approved'
        ),
      [memberships]
    );

  const isManager =
    isAdmin ||
    approvedMemberships.some(
      membership =>
        membership.role === 'manager'
    );

  const isResident =
    approvedMemberships.some(
      membership =>
        membership.role === 'resident'
    );

  const value =
    useMemo<AuthContextValue>(
      () => ({
        user,
        profile,
        memberships,
        loading,

        isAdmin,
        isManager,
        isResident,

        refreshIdentity,

        signUp,
        signIn,
        signOut,
      }),
      [
        user,
        profile,
        memberships,
        loading,
        isAdmin,
        isManager,
        isResident,
        refreshIdentity,
        signUp,
        signIn,
        signOut,
      ]
    );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth must be used inside AuthProvider'
    );
  }

  return context;
}
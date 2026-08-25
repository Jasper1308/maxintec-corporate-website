'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
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

  const mountedRef = useRef(true);
  const identityRequestRef = useRef(0);

  const loadIdentity = useCallback(
    async (
      currentUser: User | null,
      isCurrentRequest: () => boolean
    ) => {
      if (!isCurrentRequest()) return;

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

      if (!isCurrentRequest()) return;

      setProfile(currentProfile);
      setMemberships(currentMemberships);
    },
    []
  );

  const refreshIdentity =
    useCallback(async () => {
      const requestId =
        ++identityRequestRef.current;

      const isCurrentRequest = () =>
        mountedRef.current &&
        identityRequestRef.current === requestId;

      try {
        const {
          data: { user: currentUser },
          error,
        } = await supabase.auth.getUser();

        if (error) {
          throw error;
        }

        await loadIdentity(
          currentUser,
          isCurrentRequest
        );
      } catch (error) {
        console.error(
          'Failed to refresh authenticated identity:',
          error
        );
        throw error;
      } finally {
        if (isCurrentRequest()) {
          setLoading(false);
        }
      }
    }, [loadIdentity]);

  useEffect(() => {
    let mounted = true;
    mountedRef.current = true;

    async function initialize() {
      const requestId =
        ++identityRequestRef.current;

      const isCurrentRequest = () =>
        mounted &&
        identityRequestRef.current === requestId;

      try {
        const {
          data: { user: currentUser },
          error,
        } = await supabase.auth.getUser();

        if (error) {
          throw error;
        }

        if (!isCurrentRequest()) return;

        await loadIdentity(
          currentUser,
          isCurrentRequest
        );
      } catch (error) {
        if (isCurrentRequest()) {
          console.error('Failed to initialize authentication:', error);
        }
      } finally {
        if (isCurrentRequest()) {
          setLoading(false);
        }
      }
    }

    void initialize();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const requestId =
          ++identityRequestRef.current;
        const currentUser =
          session?.user ?? null;

        setTimeout(() => {
          const isCurrentRequest = () =>
            mounted &&
            identityRequestRef.current === requestId;

          if (!isCurrentRequest()) return;

          setLoading(true);

          void loadIdentity(
            currentUser,
            isCurrentRequest
          )
            .catch(error => {
              if (isCurrentRequest()) {
                console.error(
                  'Failed to refresh authenticated identity:',
                  error
                );
              }
            })
            .finally(() => {
              if (isCurrentRequest()) {
                setLoading(false);
              }
            });
        }, 0);
      }
    );

    return () => {
      mounted = false;
      mountedRef.current = false;
      identityRequestRef.current += 1;
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
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('Failed to sign out:', error);
        return;
      }

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

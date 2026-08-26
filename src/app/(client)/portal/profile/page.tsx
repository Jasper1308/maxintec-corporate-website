'use client';

import { PageHeader } from '@/components/portal/PageHeader';
import { LoadingState } from '@/components/portal/PortalStates';
import { useAuth } from '@/features/auth/AuthProvider';
import { ProfileForm } from '@/features/auth/components/ProfileForm';

export default function ProfilePage() {
  const { user, profile, loading, refreshIdentity } = useAuth();

  if (loading || !user) return <LoadingState />;

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader title="Meu perfil" description="Atualize somente seus dados pessoais seguros." />
      <ProfileForm
        key={profile?.updated_at ?? user.id}
        userId={user.id}
        email={profile?.email ?? user.email ?? ''}
        initialName={profile?.full_name ?? ''}
        initialPhone={profile?.phone ?? ''}
        onSaved={refreshIdentity}
      />
    </div>
  );
}

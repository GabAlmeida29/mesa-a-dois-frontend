'use client';

import { ACCOUNT } from '@/constants/texts';
import { useAuth } from '@/contexts/AuthContext';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { PasswordSection } from '@/components/account/PasswordSection';
import { ProfileSection } from '@/components/account/ProfileSection';
import { SessionsSection } from '@/components/account/SessionsSection';
import { TwoFactorSection } from '@/components/account/TwoFactorSection';

export default function AccountPage() {
  return (
    <RequireAuth>
      <AccountView />
    </RequireAuth>
  );
}

function AccountView() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-8 flex items-center gap-4">
        <UserAvatar name={user.name} src={user.avatarUrl} size={64} />
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">{ACCOUNT.title}</h1>
          <p className="text-muted mt-1">{ACCOUNT.subtitle}</p>
        </div>
      </div>
      <div className="space-y-5">
        <ProfileSection key={user.id} profile={user} />
        <PasswordSection userId={user.id} />
        <TwoFactorSection />
        <SessionsSection />
      </div>
    </div>
  );
}

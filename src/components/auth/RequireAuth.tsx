'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldOff } from 'lucide-react';
import { COMMON } from '@/constants/texts';
import { useAuth } from '@/contexts/AuthContext';
import type { Permission } from '@/lib/types';
import { EmptyState, Loading } from '@/components/ui/States';

interface Props {
  permission?: Permission;
  adminOnly?: boolean;
  children: React.ReactNode;
}

export function RequireAuth({ permission, adminOnly = false, children }: Props) {
  const { user, loading, isAdmin, can } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [loading, user, router]);

  if (loading || !user) return <Loading />;
  const allowed = (!adminOnly || isAdmin) && (!permission || can(permission));
  if (!allowed) {
    return (
      <div className="px-4 py-16">
        <EmptyState text={COMMON.forbidden} icon={ShieldOff} />
      </div>
    );
  }
  return <>{children}</>;
}

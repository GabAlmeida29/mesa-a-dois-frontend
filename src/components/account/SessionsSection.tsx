'use client';

import { useState } from 'react';
import { LogOut } from 'lucide-react';
import { ACCOUNT } from '@/constants/texts';
import { api } from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';
import { Section } from '@/components/ui/Section';

export function SessionsSection() {
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  async function logoutOthers() {
    setBusy(true);
    try {
      await api.logoutOthers();
      toast(ACCOUNT.sessionsDone);
    } catch (err) {
      toast(err instanceof Error ? err.message : String(err), 'error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Section icon={LogOut} title={ACCOUNT.sessionsTitle}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-muted text-sm">{ACCOUNT.sessionsText}</p>
        <button type="button" className="btn-ghost shrink-0" onClick={logoutOthers} disabled={busy}>
          <LogOut className="size-4" /> {ACCOUNT.sessionsButton}
        </button>
      </div>
    </Section>
  );
}

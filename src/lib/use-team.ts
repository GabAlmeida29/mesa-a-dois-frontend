'use client';

import { useCallback, useEffect, useState } from 'react';
import { api } from './api';
import type { TeamMember } from './types';

export function useTeam() {
  const [team, setTeam] = useState<TeamMember[] | null>(null);
  const [error, setError] = useState(false);

  const load = useCallback(() => {
    setError(false);
    api
      .team()
      .then(setTeam)
      .catch(() => setError(true));
  }, []);

  useEffect(load, [load]);
  return { team, error, reload: load };
}

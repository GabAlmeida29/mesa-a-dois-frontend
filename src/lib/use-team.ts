'use client';

import { useEffect, useState } from 'react';
import { api } from './api';
import type { TeamMember } from './types';

export function useTeam() {
  const [team, setTeam] = useState<TeamMember[] | null>(null);
  useEffect(() => {
    api
      .team()
      .then(setTeam)
      .catch(() => setTeam([]));
  }, []);
  return team;
}

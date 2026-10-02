'use client';

import { useTeam } from '@/lib/use-team';
import { InstagramLink } from './InstagramLink';

export function TeamContacts() {
  const team = useTeam();
  const handles = (team ?? []).map((p) => p.instagram).filter((h): h is string => Boolean(h));

  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {handles.map((handle) => (
        <InstagramLink key={handle} handle={handle} />
      ))}
    </div>
  );
}

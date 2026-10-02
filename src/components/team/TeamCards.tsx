'use client';

import { ABOUT } from '@/constants/texts';
import { useTeam } from '@/lib/use-team';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { Loading } from '@/components/ui/States';
import { InstagramLink } from './InstagramLink';

export function TeamCards() {
  const team = useTeam();

  if (!team) return <Loading />;
  if (!team.length) return <p className="card text-muted p-8 text-center">{ABOUT.teamEmpty}</p>;

  return (
    <div className="grid gap-5 md:grid-cols-2">
      {team.map((person) => (
        <article key={person.id} className="card flex flex-col p-6 sm:p-8">
          <UserAvatar
            name={person.name}
            src={person.avatarUrl}
            size={96}
            className="ring-accent ring-offset-surface mb-4 ring-2 ring-offset-4"
          />
          <h2 className="font-display text-2xl font-semibold">{person.name}</h2>
          {person.headline && <p className="text-accent text-sm">{person.headline}</p>}
          {person.bio && <p className="text-muted mt-3 leading-relaxed">{person.bio}</p>}
          {person.instagram && <InstagramLink handle={person.instagram} className="mt-5 self-start" />}
        </article>
      ))}
    </div>
  );
}

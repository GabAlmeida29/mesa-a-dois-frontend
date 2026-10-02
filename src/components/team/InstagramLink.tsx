import { AtSign } from 'lucide-react';
import { ABOUT } from '@/constants/texts';

export function InstagramLink({ handle, className = '' }: { handle: string; className?: string }) {
  return (
    <a
      href={`https://www.instagram.com/${handle}/`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={ABOUT.instagramLabel(handle)}
      className={`btn-ghost !py-1.5 ${className}`}
    >
      <AtSign className="text-accent size-4" /> {handle}
    </a>
  );
}

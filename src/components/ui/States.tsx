import { AlertTriangle, Loader2, UtensilsCrossed, type LucideIcon } from 'lucide-react';
import { COMMON } from '@/constants/texts';

export function Loading({ text = COMMON.loading }: { text?: string }) {
  return (
    <div className="text-muted flex items-center justify-center gap-2 py-20">
      <Loader2 className="size-5 animate-spin" /> {text}
    </div>
  );
}

export function ErrorState({ message = COMMON.error, onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div className="card mx-auto flex max-w-md flex-col items-center gap-3 p-8 text-center">
      <AlertTriangle className="text-bad size-8" />
      <p className="text-muted">{message}</p>
      {onRetry && (
        <button className="btn-ghost" onClick={onRetry}>
          {COMMON.retry}
        </button>
      )}
    </div>
  );
}

export function EmptyState({
  text,
  icon: Icon = UtensilsCrossed,
  children,
}: {
  text: string;
  icon?: LucideIcon;
  children?: React.ReactNode;
}) {
  return (
    <div className="card mx-auto flex max-w-md flex-col items-center gap-4 p-10 text-center">
      <Icon className="text-faint size-10" />
      <p className="text-muted">{text}</p>
      {children}
    </div>
  );
}

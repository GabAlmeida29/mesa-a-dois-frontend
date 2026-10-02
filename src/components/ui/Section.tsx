import type { LucideIcon } from 'lucide-react';

export function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: LucideIcon;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="card space-y-4 p-5 sm:p-6">
      <h2 className="font-display flex items-center gap-2 text-lg font-semibold">
        <Icon className="text-accent size-5" /> {title}
      </h2>
      {children}
    </section>
  );
}

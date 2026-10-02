export function Panel({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="card p-5">
      <h2 className="font-display text-lg font-semibold">{title}</h2>
      {subtitle && <p className="text-faint text-xs">{subtitle}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

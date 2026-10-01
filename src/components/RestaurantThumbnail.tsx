export function RestaurantThumbnail({
  name,
  url,
  size = 56,
}: {
  name: string;
  url: string | null;
  size?: number;
}) {
  const style = { width: size, height: size };

  if (url) {
    return (
      <img
        src={url}
        alt={name}
        loading="lazy"
        style={style}
        className="border-border bg-surface-2 shrink-0 rounded-xl border object-cover"
      />
    );
  }

  return (
    <span
      aria-hidden
      style={{ ...style, fontSize: size * 0.42 }}
      className="from-accent to-gold font-display grid shrink-0 place-items-center rounded-xl bg-gradient-to-br font-semibold text-black"
    >
      {name.trim().charAt(0).toUpperCase() || '?'}
    </span>
  );
}

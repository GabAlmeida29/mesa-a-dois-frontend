import clsx from 'clsx';

interface Props {
  name: string;
  src?: string | null;
  size?: number;
  className?: string;
}

export function UserAvatar({ name, src, size = 32, className }: Props) {
  const style = { width: size, height: size };

  if (src) {
    return (
      <img
        src={src}
        alt=""
        style={style}
        className={clsx('shrink-0 rounded-full object-cover', className ?? 'ring-border ring-1')}
      />
    );
  }

  return (
    <span
      style={{ ...style, fontSize: size * 0.42 }}
      className={clsx(
        'from-accent to-gold font-display text-on-accent grid shrink-0 place-items-center rounded-full bg-gradient-to-br font-semibold',
        className,
      )}
    >
      {name.trim().charAt(0).toUpperCase()}
    </span>
  );
}

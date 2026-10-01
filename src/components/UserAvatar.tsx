import clsx from 'clsx';
import { ABOUT } from '@/constants/texts';

export function UserAvatar({
  name,
  size = 32,
  className,
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  const photo = ABOUT.people.find(
    (p) => p.name.toLowerCase() === name.trim().split(' ')[0].toLowerCase(),
  )?.photo;
  const style = { width: size, height: size };

  if (photo) {
    return (
      <img
        src={photo}
        alt=""
        style={style}
        className={clsx('ring-border shrink-0 rounded-full object-cover ring-1', className)}
      />
    );
  }

  return (
    <span
      style={{ ...style, fontSize: size * 0.42 }}
      className={clsx(
        'from-accent to-gold font-display grid shrink-0 place-items-center rounded-full bg-gradient-to-br font-semibold text-black',
        className,
      )}
    >
      {name.trim().charAt(0).toUpperCase()}
    </span>
  );
}

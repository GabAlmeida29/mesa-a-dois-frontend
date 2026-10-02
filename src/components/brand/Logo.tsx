import clsx from 'clsx';
import { APP } from '@/constants/texts';

const EMBLEM = { src: '/brand/emblem.webp', width: 230, height: 192 };
const WORDMARK = { src: '/brand/wordmark.webp', width: 398, height: 96 };
const FULL = { src: '/brand/logo.webp', width: 720, height: 437 };

export function LogoLockup({ className }: { className?: string }) {
  return (
    <span className={clsx('flex items-center gap-2.5', className)}>
      <img
        src={EMBLEM.src}
        width={EMBLEM.width}
        height={EMBLEM.height}
        alt=""
        className="brand-image h-10 w-auto"
      />
      <img
        src={WORDMARK.src}
        width={WORDMARK.width}
        height={WORDMARK.height}
        alt={APP.name}
        className="brand-image h-7 w-auto translate-y-0.5"
      />
    </span>
  );
}

export function LogoFull({ className }: { className?: string }) {
  return (
    <img
      src={FULL.src}
      width={FULL.width}
      height={FULL.height}
      alt={APP.name}
      className={clsx('brand-image h-auto', className)}
    />
  );
}

export function LogoWordmark({ className }: { className?: string }) {
  return (
    <img
      src={WORDMARK.src}
      width={WORDMARK.width}
      height={WORDMARK.height}
      alt={APP.name}
      className={clsx('brand-image w-auto', className)}
    />
  );
}

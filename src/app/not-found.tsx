import Link from 'next/link';
import { COMMON, LOGIN } from '@/constants/texts';

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-24 text-center">
      <p className="font-display text-accent text-7xl font-semibold">404</p>
      <h1 className="font-display text-2xl font-semibold">{COMMON.notFoundTitle}</h1>
      <p className="text-muted">{COMMON.notFoundText}</p>
      <Link href="/" className="btn-primary">
        {LOGIN.backHome}
      </Link>
    </div>
  );
}

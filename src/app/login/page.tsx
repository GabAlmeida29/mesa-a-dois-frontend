'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, KeyRound, Loader2, Lock } from 'lucide-react';
import { LOGIN } from '@/constants/texts';
import { useAuth } from '@/contexts/AuthContext';
import { ApiError } from '@/lib/api';

const schema = z.object({
  email: z.string().trim().email(LOGIN.emailInvalid),
  password: z.string().min(1, LOGIN.passwordRequired),
});
type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const { login, user } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const [pending, setPending] = useState<FormValues | null>(null);
  const [code, setCode] = useState('');
  const [verifying, setVerifying] = useState(false);

  const [setupEmail, setSetupEmail] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  function handleError(e: unknown, fallback: string) {
    if (e instanceof ApiError && e.status === 429) setError(LOGIN.locked);
    else setError(fallback);
  }

  async function onSubmit(v: FormValues) {
    setError(null);
    try {
      await login(v.email, v.password);
      router.push('/restaurantes');
    } catch (e) {
      if (e instanceof ApiError && e.mfaRequired) {
        setPending(v);
        return;
      }
      if (e instanceof ApiError && e.mfaSetupRequired) {
        setSetupEmail(v.email);
        return;
      }
      handleError(e, LOGIN.invalid);
    }
  }

  async function onVerify(e: React.FormEvent) {
    e.preventDefault();
    if (!pending || code.length !== 6) return;
    setError(null);
    setVerifying(true);
    try {
      await login(pending.email, pending.password, code);
      setPending(null);
      router.push('/restaurantes');
    } catch (err) {
      setCode('');
      handleError(err, LOGIN.mfaInvalid);
    } finally {
      setVerifying(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16 sm:py-24">
      <div className="card p-6 sm:p-8">
        <span className="bg-accent/15 text-accent mb-4 grid size-12 place-items-center rounded-full">
          {pending ? <KeyRound className="size-5" /> : <Lock className="size-5" />}
        </span>
        <h1 className="font-display text-2xl font-semibold">{pending ? LOGIN.mfaTitle : LOGIN.title}</h1>
        <p className="text-muted mt-1 text-sm">{pending ? LOGIN.mfaSubtitle : LOGIN.subtitle}</p>

        {user ? (
          <div className="mt-6 space-y-4">
            <p className="text-sm">{LOGIN.alreadyLogged}</p>
            <Link href="/" className="btn-primary w-full">
              {LOGIN.backHome}
            </Link>
          </div>
        ) : setupEmail ? (
          <div className="mt-6 space-y-4">
            <h2 className="font-medium">{LOGIN.mfaSetupTitle}</h2>
            <p className="text-muted text-sm">{LOGIN.mfaSetupText}</p>
            <code className="bg-surface-2 text-gold block overflow-x-auto rounded-xl px-3 py-2 text-xs">
              {LOGIN.mfaSetupCommand(setupEmail)}
            </code>
            <button type="button" className="btn-ghost w-full" onClick={() => setSetupEmail(null)}>
              <ArrowLeft className="size-4" /> {LOGIN.mfaBack}
            </button>
          </div>
        ) : pending ? (
          <form onSubmit={onVerify} className="mt-6 space-y-4">
            <div>
              <label className="label" htmlFor="code">
                {LOGIN.mfaCode}
              </label>
              <input
                id="code"
                className="input text-center font-mono text-2xl tracking-[0.5em]"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                autoFocus
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              />
            </div>
            {error && <p className="bg-bad/10 text-bad rounded-xl px-3 py-2 text-sm">{error}</p>}
            <button
              type="submit"
              className="btn-primary w-full !py-2.5"
              disabled={verifying || code.length !== 6}
            >
              {verifying && <Loader2 className="size-4 animate-spin" />}
              {verifying ? LOGIN.submitting : LOGIN.submit}
            </button>
            <button
              type="button"
              className="btn-ghost w-full"
              onClick={() => {
                setPending(null);
                setCode('');
                setError(null);
              }}
            >
              <ArrowLeft className="size-4" /> {LOGIN.mfaBack}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
            <div>
              <label className="label" htmlFor="email">
                {LOGIN.email}
              </label>
              <input
                id="email"
                type="email"
                autoComplete="username"
                className="input"
                {...register('email')}
              />
              {errors.email && <p className="field-error">{errors.email.message}</p>}
            </div>
            <div>
              <label className="label" htmlFor="password">
                {LOGIN.password}
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                className="input"
                {...register('password')}
              />
              {errors.password && <p className="field-error">{errors.password.message}</p>}
            </div>
            {error && <p className="bg-bad/10 text-bad rounded-xl px-3 py-2 text-sm">{error}</p>}
            <button type="submit" className="btn-primary w-full !py-2.5" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="size-4 animate-spin" />}
              {isSubmitting ? LOGIN.submitting : LOGIN.submit}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

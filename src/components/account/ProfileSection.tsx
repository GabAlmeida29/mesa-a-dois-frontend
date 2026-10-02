'use client';

import { useState } from 'react';
import { AtSign, Loader2, Save, UserRound } from 'lucide-react';
import { ACCOUNT } from '@/constants/texts';
import { api, ApiError } from '@/lib/api';
import { emptyToNull, fieldErrorFrom } from '@/lib/form-utils';
import type { Profile, ProfileInput } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { ImageUpload } from '@/components/image/ImageUpload';
import { Section } from '@/components/ui/Section';

const toForm = (p: Profile) => ({
  name: p.name,
  headline: p.headline ?? '',
  bio: p.bio ?? '',
  instagram: p.instagram ?? '',
  avatarUrl: p.avatarUrl,
  showOnAbout: p.showOnAbout,
});

export function ProfileSection({ profile }: { profile: Profile }) {
  const { setUser } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState(() => toForm(profile));
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [saving, setSaving] = useState(false);

  const update = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    const payload: ProfileInput = {
      name: form.name.trim(),
      headline: emptyToNull(form.headline),
      bio: emptyToNull(form.bio),
      instagram: emptyToNull(form.instagram.replace(/^@/, '')),
      avatarUrl: form.avatarUrl,
      showOnAbout: form.showOnAbout,
    };
    setSaving(true);
    setErrors({});
    try {
      const { user } = await api.updateMe(payload);
      setUser(user);
      setForm(toForm(user));
      toast(ACCOUNT.profileSaved);
    } catch (err) {
      if (err instanceof ApiError && err.details) {
        setErrors({ instagram: fieldErrorFrom(err.details, 'instagram') });
      } else toast(err instanceof Error ? err.message : String(err), 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Section icon={UserRound} title={ACCOUNT.profileTitle}>
      <form onSubmit={save} className="grid gap-6 sm:grid-cols-[10rem_1fr]">
        <div className="space-y-2">
          <ImageUpload
            label={ACCOUNT.photo}
            folder="avatars"
            round
            value={form.avatarUrl}
            onChange={(url) => update('avatarUrl', url)}
            className="mx-auto w-40 sm:w-full"
          />
          <p className="text-faint text-center text-xs sm:text-left">{ACCOUNT.photoHint}</p>
        </div>

        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="profile-name">
                {ACCOUNT.name}
              </label>
              <input
                id="profile-name"
                className="input"
                maxLength={80}
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
              />
            </div>
            <div>
              <label className="label" htmlFor="profile-email">
                {ACCOUNT.email}
              </label>
              <input id="profile-email" className="input opacity-70" value={profile.email} readOnly />
            </div>
          </div>
          <div>
            <label className="label" htmlFor="profile-headline">
              {ACCOUNT.headline}
            </label>
            <input
              id="profile-headline"
              className="input"
              maxLength={120}
              placeholder={ACCOUNT.headlinePlaceholder}
              value={form.headline}
              onChange={(e) => update('headline', e.target.value)}
            />
          </div>
          <div>
            <label className="label" htmlFor="profile-bio">
              {ACCOUNT.bio}
            </label>
            <textarea
              id="profile-bio"
              rows={3}
              maxLength={600}
              className="input resize-y"
              placeholder={ACCOUNT.bioPlaceholder}
              value={form.bio}
              onChange={(e) => update('bio', e.target.value)}
            />
          </div>
          <div>
            <label className="label" htmlFor="profile-instagram">
              {ACCOUNT.instagram}
            </label>
            <div className="relative">
              <AtSign className="text-faint pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
              <input
                id="profile-instagram"
                className="input !pl-9"
                maxLength={31}
                placeholder={ACCOUNT.instagramPlaceholder}
                value={form.instagram}
                onChange={(e) => update('instagram', e.target.value)}
              />
            </div>
            {errors.instagram && <p className="field-error">{errors.instagram}</p>}
          </div>
          <div className="flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between">
            <label className="flex cursor-pointer items-center gap-3 text-sm">
              <input
                type="checkbox"
                className="size-4 accent-[var(--color-accent)]"
                checked={form.showOnAbout}
                onChange={(e) => update('showOnAbout', e.target.checked)}
              />
              {ACCOUNT.showOnAbout}
            </label>
            <button type="submit" className="btn-primary" disabled={saving || !form.name.trim()}>
              {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
              {ACCOUNT.saveProfile}
            </button>
          </div>
        </div>
      </form>
    </Section>
  );
}

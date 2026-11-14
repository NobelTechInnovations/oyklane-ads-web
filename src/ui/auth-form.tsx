'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { Button } from './index';

export interface AuthField {
  name: string;
  label: string;
  type?: 'text' | 'email' | 'password';
  autoComplete?: string;
  hint?: string;
  /** Six-digit code input. */
  code?: boolean;
}

/** The `email` value from the page address, e.g. /verify?email=a@b.com. */
export function useEmailFromAddress(): string {
  const [email, setEmail] = useState('');
  useEffect(() => {
    setEmail(new URLSearchParams(window.location.search).get('email') ?? '');
  }, []);
  return email;
}

/** One-column form used by every signed-out page: title, fields, one button, error and links. */
export function AuthForm(props: {
  title: string;
  intro?: ReactNode;
  fields: AuthField[];
  initial?: Record<string, string>;
  submitLabel: string;
  /** Returns an error message to show, or nothing on success. */
  onSubmit: (values: Record<string, string>) => Promise<string | void>;
  notice?: ReactNode;
  footer?: ReactNode;
}) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const valueOf = (name: string) => values[name] ?? props.initial?.[name] ?? '';

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError('');
    const all = Object.fromEntries(props.fields.map((field) => [field.name, valueOf(field.name)]));
    try {
      setError((await props.onSubmit(all)) ?? '');
    } catch {
      setError('We could not reach Oyklane Ads. Check your connection and try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} noValidate={false}>
      <h1 className="text-2xl font-bold">{props.title}</h1>
      {props.intro ? <p className="mt-1.5 text-mute">{props.intro}</p> : null}
      {props.notice ? <p className="mt-4 rounded-lg bg-soft px-3.5 py-2.5 text-sm">{props.notice}</p> : null}
      <div className="mt-6 space-y-4">
        {props.fields.map((field) => (
          <label key={field.name} className="block">
            <span className="mb-1.5 block text-sm font-semibold">{field.label}</span>
            <input
              name={field.name}
              type={field.type ?? 'text'}
              required
              autoComplete={field.autoComplete}
              inputMode={field.code ? 'numeric' : undefined}
              pattern={field.code ? '[0-9]{6}' : undefined}
              maxLength={field.code ? 6 : 200}
              value={valueOf(field.name)}
              onChange={(event) => setValues({ ...values, [field.name]: event.target.value })}
              className="w-full rounded-lg border border-line px-3 py-2.5 outline-none focus:border-brand"
            />
            {field.hint ? <span className="mt-1 block text-sm text-mute">{field.hint}</span> : null}
          </label>
        ))}
      </div>
      {error ? (
        <p role="alert" className="mt-4 text-sm text-danger">
          {error}
        </p>
      ) : null}
      <div className="mt-6">
        <Button type="submit" variant="primary" block disabled={busy}>
          {busy ? 'Please wait…' : props.submitLabel}
        </Button>
      </div>
      {props.footer ? <div className="mt-5 text-sm text-mute">{props.footer}</div> : null}
    </form>
  );
}

export function TextLink(props: { href: string; children: ReactNode }) {
  return (
    <Link href={props.href} className="font-medium text-brand">
      {props.children}
    </Link>
  );
}

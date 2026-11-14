'use client';

import { useRouter } from 'next/navigation';
import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { api } from './client';

export interface Me {
  user: { id: string; email: string; name: string; emailVerified: boolean };
  memberships: {
    organisationId: string;
    organisationName: string;
    role: 'owner' | 'admin' | 'editor' | 'analyst';
    adAccountIds: string[];
  }[];
}

/** Reads the message our API puts in its problem+json errors. */
export function problemMessage(error: unknown): string {
  const problem = error as { detail?: string; errors?: { path: string; message: string }[] } | undefined;
  const field = problem?.errors?.[0];
  if (field) return field.path + ': ' + field.message;
  return problem?.detail ?? 'Something went wrong. Please try again.';
}

const SessionContext = createContext<Me | null>(null);

/** The signed-in user. Only valid inside SessionGate. */
export function useSession(): Me {
  const me = useContext(SessionContext);
  if (!me) throw new Error('useSession must be used inside SessionGate');
  return me;
}

type State = { status: 'loading' } | { status: 'ready'; me: Me } | { status: 'error' };

/** Shows its children only to a signed-in user; everyone else is sent to the login page. */
export function SessionGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<State>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    api
      .GET('/v1/me')
      .then(({ data, response }) => {
        if (cancelled) return;
        if (response.status === 401) router.replace('/login');
        else if (response.ok) setState({ status: 'ready', me: data as unknown as Me });
        else setState({ status: 'error' });
      })
      .catch(() => {
        if (!cancelled) setState({ status: 'error' });
      });
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (state.status === 'error') {
    return <p className="p-8 text-mute">We could not reach Oyklane Ads. Check your connection and reload.</p>;
  }
  if (state.status === 'loading') return <p className="p-8 text-mute">Loading…</p>;
  return <SessionContext.Provider value={state.me}>{children}</SessionContext.Provider>;
}

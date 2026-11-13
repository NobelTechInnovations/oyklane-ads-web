'use client';

import { useEffect, useState } from 'react';
import { api } from '@/api/client';
import { Status } from './index';

type State = 'checking' | 'ok' | 'degraded' | 'unreachable';
const LABEL: Record<State, string> = {
  checking: 'Checking API',
  ok: 'API connected',
  degraded: 'API running, a service is down',
  unreachable: 'API not reachable',
};
const TONE = { checking: 'idle', ok: 'ok', degraded: 'warn', unreachable: 'danger' } as const;

/** Shows whether the backend answers, using the generated client. */
export function ApiStatus() {
  const [state, setState] = useState<State>('checking');
  useEffect(() => {
    let cancelled = false;
    api
      .GET('/v1/health')
      .then(({ data, response }) => {
        if (cancelled) return;
        setState(data?.status === 'ok' ? 'ok' : response.status === 503 ? 'degraded' : 'unreachable');
      })
      .catch(() => {
        if (!cancelled) setState('unreachable');
      });
    return () => {
      cancelled = true;
    };
  }, []);
  return <Status tone={TONE[state]}>{LABEL[state]}</Status>;
}

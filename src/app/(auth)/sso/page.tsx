'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { api } from '@/api/client';
import { errorText, unwrap } from '@/api/request';

/** Landing page for "Open Oyklane Ads" in Oyklane: /sso#token=… */
export default function SsoPage() {
  const router = useRouter();
  const started = useRef(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const token = new URLSearchParams(window.location.hash.slice(1)).get('token');
    // The token is single use; keep it out of history either way.
    window.history.replaceState(null, '', '/sso');
    if (!token) {
      setError('This link has no sign-in code. Open Oyklane Ads from Oyklane again.');
      return;
    }
    unwrap(api.POST('/v1/auth/oyklane', { body: { token } }))
      .then(() => router.replace('/home'))
      .catch((caught) => setError(errorText(caught)));
  }, [router]);

  if (!error) return <p className="text-mute">Signing you in from Oyklane…</p>;
  return (
    <>
      <h1 className="mb-3 text-2xl font-bold">Could not sign you in</h1>
      <p className="mb-6 text-mute">{error}</p>
      <Link href="/login" className="font-medium text-brand">
        Log in with email instead
      </Link>
    </>
  );
}

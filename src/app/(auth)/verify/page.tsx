'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { api } from '@/api/client';
import { problemMessage } from '@/api/session';
import { AuthForm, useEmailFromAddress } from '@/ui/auth-form';

export default function VerifyPage() {
  const router = useRouter();
  const email = useEmailFromAddress();
  const [resent, setResent] = useState(false);
  return (
    <AuthForm
      title="Check your email"
      intro="We sent a 6-digit code. It is valid for 10 minutes."
      fields={[
        { name: 'email', label: 'Email', type: 'email', autoComplete: 'email' },
        { name: 'code', label: 'Code', code: true, autoComplete: 'one-time-code' },
      ]}
      initial={{ email }}
      notice={resent ? 'If that email has an account waiting, a new code is on its way.' : undefined}
      submitLabel="Verify email"
      onSubmit={async (values) => {
        const { error } = await api.POST('/v1/auth/verify-email', { body: values as never });
        if (error) return problemMessage(error);
        router.push('/login?verified=1&email=' + encodeURIComponent(values.email ?? ''));
      }}
      footer={
        <button
          type="button"
          className="cursor-pointer font-medium text-brand"
          onClick={async () => {
            await api.POST('/v1/auth/resend-code', { body: { email } as never });
            setResent(true);
          }}
        >
          Send a new code
        </button>
      }
    />
  );
}

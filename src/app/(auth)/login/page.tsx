'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api } from '@/api/client';
import { problemMessage } from '@/api/session';
import { AuthForm, TextLink, useEmailFromAddress } from '@/ui/auth-form';

export default function LoginPage() {
  const router = useRouter();
  const email = useEmailFromAddress();
  const [notice, setNotice] = useState('');
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('verified')) setNotice('Email verified. Log in to continue.');
    if (params.get('reset')) setNotice('Password changed. Log in with your new password.');
  }, []);
  return (
    <AuthForm
      title="Log in"
      fields={[
        { name: 'email', label: 'Email', type: 'email', autoComplete: 'email' },
        { name: 'password', label: 'Password', type: 'password', autoComplete: 'current-password' },
      ]}
      initial={{ email }}
      notice={notice || undefined}
      submitLabel="Log in"
      onSubmit={async (values) => {
        const { error } = await api.POST('/v1/auth/login', { body: values as never });
        if (!error) return router.replace('/home');
        if (String((error as { type?: string }).type).endsWith('identity.email_not_verified')) {
          await api.POST('/v1/auth/resend-code', { body: { email: values.email } as never });
          return router.push('/verify?email=' + encodeURIComponent(values.email ?? ''));
        }
        return problemMessage(error);
      }}
      footer={
        <span className="flex justify-between">
          <TextLink href="/forgot">Forgot password?</TextLink>
          <TextLink href="/signup">Create account</TextLink>
        </span>
      }
    />
  );
}

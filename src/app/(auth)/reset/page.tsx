'use client';

import { useRouter } from 'next/navigation';
import { api } from '@/api/client';
import { problemMessage } from '@/api/session';
import { AuthForm, TextLink, useEmailFromAddress } from '@/ui/auth-form';

export default function ResetPage() {
  const router = useRouter();
  const email = useEmailFromAddress();
  return (
    <AuthForm
      title="Choose a new password"
      intro="If that email has an account, a code is on its way. It is valid for 10 minutes."
      fields={[
        { name: 'email', label: 'Email', type: 'email', autoComplete: 'email' },
        { name: 'code', label: 'Code', code: true, autoComplete: 'one-time-code' },
        { name: 'newPassword', label: 'New password', type: 'password', autoComplete: 'new-password', hint: 'At least 10 characters.' },
      ]}
      initial={{ email }}
      submitLabel="Change password"
      onSubmit={async (values) => {
        const { error } = await api.POST('/v1/auth/password/reset', { body: values as never });
        if (error) return problemMessage(error);
        router.push('/login?reset=1&email=' + encodeURIComponent(values.email ?? ''));
      }}
      footer={<TextLink href="/login">Back to log in</TextLink>}
    />
  );
}

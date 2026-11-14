'use client';

import { useRouter } from 'next/navigation';
import { api } from '@/api/client';
import { problemMessage } from '@/api/session';
import { AuthForm, TextLink } from '@/ui/auth-form';

export default function ForgotPage() {
  const router = useRouter();
  return (
    <AuthForm
      title="Reset your password"
      intro="Enter your email and we will send a 6-digit code."
      fields={[{ name: 'email', label: 'Email', type: 'email', autoComplete: 'email' }]}
      submitLabel="Send code"
      onSubmit={async (values) => {
        const { error } = await api.POST('/v1/auth/password/forgot', { body: values as never });
        if (error) return problemMessage(error);
        router.push('/reset?email=' + encodeURIComponent(values.email ?? ''));
      }}
      footer={<TextLink href="/login">Back to log in</TextLink>}
    />
  );
}

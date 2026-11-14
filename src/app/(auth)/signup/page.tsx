'use client';

import { useRouter } from 'next/navigation';
import { api } from '@/api/client';
import { problemMessage } from '@/api/session';
import { AuthForm, TextLink } from '@/ui/auth-form';

export default function SignUpPage() {
  const router = useRouter();
  return (
    <AuthForm
      title="Create your account"
      intro="Run one ad on Instagram, Facebook, Google and Oyklane stores."
      fields={[
        { name: 'name', label: 'Your name', autoComplete: 'name' },
        { name: 'organisationName', label: 'Business name', autoComplete: 'organization' },
        { name: 'email', label: 'Email', type: 'email', autoComplete: 'email' },
        { name: 'password', label: 'Password', type: 'password', autoComplete: 'new-password', hint: 'At least 10 characters.' },
      ]}
      submitLabel="Create account"
      onSubmit={async (values) => {
        const { error } = await api.POST('/v1/auth/signup', { body: values as never });
        if (error) return problemMessage(error);
        router.push('/verify?email=' + encodeURIComponent(values.email ?? ''));
      }}
      footer={
        <>
          Already have an account? <TextLink href="/login">Log in</TextLink>
        </>
      }
    />
  );
}

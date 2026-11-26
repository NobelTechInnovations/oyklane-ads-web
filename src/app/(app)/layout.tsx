'use client';

import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { api } from '@/api/client';
import { SessionGate, useSession } from '@/api/session';
import { AppShell } from '@/ui/app-shell';

const NAV = [
  { href: '/', label: 'Home' },
  { href: '/create', label: 'Create ad' },
  { href: '/campaigns', label: 'Campaigns' },
  { href: '/media', label: 'Media' },
];

function AccountMenu() {
  const router = useRouter();
  const { user, memberships } = useSession();
  const logOut = async () => {
    await api.POST('/v1/auth/logout');
    router.replace('/login');
  };
  return (
    <span className="flex items-center gap-3 whitespace-nowrap text-sm">
      <span className="text-mute">
        {memberships[0]?.organisationName} · {user.name}
      </span>
      <button type="button" onClick={logOut} className="cursor-pointer font-medium text-brand">
        Log out
      </button>
    </span>
  );
}

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <SessionGate>
      <AppShell product="Oyklane Ads" nav={NAV} right={<AccountMenu />}>
        {children}
      </AppShell>
    </SessionGate>
  );
}

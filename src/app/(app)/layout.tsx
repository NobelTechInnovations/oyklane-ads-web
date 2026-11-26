'use client';

import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { api } from '@/api/client';
import { SessionGate, useSession } from '@/api/session';
import { AppShell } from '@/ui/app-shell';
import type { NavItem } from '@/ui/app-shell';

const NAV: NavItem[] = [
  { href: '/home', label: 'Overview', icon: 'home' },
  { href: '/campaigns', label: 'Campaigns', icon: 'campaigns' },
  { href: '/create', label: 'Create ad', icon: 'create' },
  { href: '/media', label: 'Media library', icon: 'media' },
];

function AccountMenu() {
  const router = useRouter();
  const { user, memberships } = useSession();
  const logOut = async () => {
    await api.POST('/v1/auth/logout');
    router.replace('/login');
  };
  const initial = (user.name || user.email).slice(0, 1).toUpperCase();
  return (
    <span className="flex items-center gap-3 whitespace-nowrap text-[13px]">
      <span className="hidden text-right leading-tight sm:block">
        <b className="block text-[12px]">{memberships[0]?.organisationName}</b>
        <span className="text-[11px] text-mute">{user.email}</span>
      </span>
      <span className="grid h-7 w-7 place-items-center rounded-full bg-brand text-[12px] font-bold text-white">{initial}</span>
      <button type="button" onClick={logOut} className="cursor-pointer text-[12px] font-semibold text-brand">
        Log out
      </button>
    </span>
  );
}

function AccountFooter() {
  const { memberships } = useSession();
  const membership = memberships[0];
  return (
    <>
      <div className="font-semibold text-ink">{membership?.organisationName}</div>
      <div>Ad account · INR · {membership?.role}</div>
    </>
  );
}

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <SessionGate>
      <AppShell nav={NAV} right={<AccountMenu />} sidebarFooter={<AccountFooter />}>
        {children}
      </AppShell>
    </SessionGate>
  );
}

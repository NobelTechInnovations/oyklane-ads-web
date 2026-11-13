import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { ApiStatus } from '@/ui/api-status';
import { AppShell } from '@/ui/app-shell';
import './globals.css';

export const metadata: Metadata = { title: 'Oyklane Ads' };

const NAV = [
  { href: '/', label: 'Home' },
  { href: '/create', label: 'Create ad' },
  { href: '/campaigns', label: 'Campaigns' },
];

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppShell product="Oyklane Ads" nav={NAV} right={<ApiStatus />}>
          {children}
        </AppShell>
      </body>
    </html>
  );
}

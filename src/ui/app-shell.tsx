'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { Logo } from './index';

export interface NavItem {
  href: string;
  label: string;
  icon: keyof typeof ICONS;
}

const ICONS = {
  home: 'M3 10.5 12 3l9 7.5M5 9v11h5v-6h4v6h5V9',
  campaigns: 'M4 13V9l11-5v16L4 15v-2Zm0 0h3m-3 2 2 5h3l-1.5-4.5M18 9.5a3 3 0 0 1 0 5',
  create: 'M12 5v14M5 12h14',
  media: 'M4 5h16v14H4zM4 15l4.5-4.5 4 4L15 12l5 5M15.5 8.5h.01',
  review: 'M9 12l2 2 4-4M12 3l7 3v6c0 4-3 7-7 9-4-2-7-5-7-9V6z',
  settings: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm7.4-3a7.4 7.4 0 0 0-.1-1.2l2-1.6-2-3.4-2.4 1a7.4 7.4 0 0 0-2-1.2L14.5 3h-5l-.4 2.6a7.4 7.4 0 0 0-2 1.2l-2.4-1-2 3.4 2 1.6a7.4 7.4 0 0 0 0 2.4l-2 1.6 2 3.4 2.4-1a7.4 7.4 0 0 0 2 1.2l.4 2.6h5l.4-2.6a7.4 7.4 0 0 0 2-1.2l2.4 1 2-3.4-2-1.6c.1-.4.1-.8.1-1.2Z',
} as const;

function Icon({ name }: { name: keyof typeof ICONS }) {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" aria-hidden="true" className="flex-none">
      <path d={ICONS[name]} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Left navigation, a slim top bar and the page. */
export function AppShell(props: { nav: NavItem[]; right?: ReactNode; sidebarFooter?: ReactNode; children: ReactNode }) {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');
  const link = (item: NavItem, compact = false) => (
    <Link
      key={item.href}
      href={item.href}
      aria-current={isActive(item.href) ? 'page' : undefined}
      className={
        'flex items-center gap-2.5 rounded-md text-[13px] font-medium ' +
        (compact ? 'px-2 py-1.5 whitespace-nowrap ' : 'px-3 py-2 ') +
        (isActive(item.href) ? 'bg-brand/8 text-brand' : 'text-ink/80 hover:bg-soft')
      }
    >
      <Icon name={item.icon} />
      {item.label}
    </Link>
  );
  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 hidden h-screen w-[212px] flex-none flex-col border-r border-line bg-white md:flex">
        <Link href="/home" className="flex h-12 items-center border-b border-line px-4">
          <Logo />
        </Link>
        <nav className="flex-1 space-y-0.5 overflow-y-auto p-2">{props.nav.map((item) => link(item))}</nav>
        {props.sidebarFooter ? <div className="border-t border-line p-3 text-[12px] text-mute">{props.sidebarFooter}</div> : null}
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-12 items-center gap-3 border-b border-line bg-white px-4">
          <Link href="/home" className="md:hidden">
            <Logo />
          </Link>
          <nav className="flex gap-1 overflow-x-auto md:hidden">{props.nav.map((item) => link(item, true))}</nav>
          <span className="flex-1" />
          {props.right}
        </header>
        <main className="mx-auto w-full max-w-[1440px] flex-1 px-4 py-4 md:px-5">{props.children}</main>
      </div>
    </div>
  );
}

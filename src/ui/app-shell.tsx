'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

export interface NavItem {
  href: string;
  label: string;
}

/** Top bar with the product name, main navigation and a slot on the right. */
export function AppShell(props: {
  product: string;
  nav: NavItem[];
  right?: ReactNode;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href));
  return (
    <>
      <header className="sticky top-0 z-10 flex h-14 items-center gap-6 overflow-x-auto border-b border-line bg-white px-5">
        <span className="whitespace-nowrap text-[17px] font-bold">{props.product}</span>
        <nav className="flex h-full gap-6">
          {props.nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? 'page' : undefined}
              className={
                'flex items-center whitespace-nowrap border-b-2 font-medium ' +
                (isActive(item.href) ? 'border-ink text-ink' : 'border-transparent text-mute')
              }
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <span className="flex-1" />
        {props.right}
      </header>
      <main className="mx-auto max-w-[1320px] px-5 pb-16 pt-7">{props.children}</main>
    </>
  );
}

import Link from 'next/link';
import type { ReactNode } from 'react';
import { Logo } from '@/ui';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="grid min-h-screen place-items-center bg-[radial-gradient(1200px_600px_at_10%_0%,#fff3e6,transparent),radial-gradient(900px_600px_at_100%_100%,#ece7ff,transparent)] px-4 py-10">
      <div className="w-full max-w-[400px]">
        <Link href="/" className="mb-5 inline-block">
          <Logo />
        </Link>
        <div className="rounded-xl border border-line bg-white p-6 shadow-sm">{children}</div>
      </div>
    </main>
  );
}

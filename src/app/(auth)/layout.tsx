import type { ReactNode } from 'react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="mx-auto max-w-[420px] px-5 py-14">
      <div className="mb-8 text-[19px] font-bold">Oyklane Ads</div>
      {children}
    </main>
  );
}

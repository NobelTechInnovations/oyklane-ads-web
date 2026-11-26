'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAccount } from '@/api/account';
import { api } from '@/api/client';
import { unwrap } from '@/api/request';
import type { Asset, Campaign, Page } from '@/api/types';
import { Delivery } from '@/components/delivery';
import { DataTable, PageHeader, Section, Stat } from '@/ui';

const METRICS = ['Amount spent', 'Impressions', 'Reach', 'Clicks', 'CTR', 'Cost per click'];

export default function HomePage() {
  const { accountId, organisationName } = useAccount();
  const [campaigns, setCampaigns] = useState<Campaign[] | null>(null);
  const [media, setMedia] = useState<number | null>(null);

  useEffect(() => {
    const path = { params: { path: { accountId }, query: { limit: 5 } } };
    unwrap<Page<Campaign>>(api.GET('/v1/ad-accounts/{accountId}/campaigns', path))
      .then((page) => setCampaigns(page.items))
      .catch(() => setCampaigns([]));
    unwrap<Page<Asset>>(api.GET('/v1/ad-accounts/{accountId}/assets', path))
      .then((page) => setMedia(page.items.length))
      .catch(() => setMedia(0));
  }, [accountId]);

  const steps = [
    { done: (media ?? 0) > 0, title: 'Add images to your media library', href: '/media', action: 'Upload' },
    { done: (campaigns?.length ?? 0) > 0, title: 'Create your first campaign', href: '/create', action: 'Create' },
    { done: false, title: 'Connect your Meta (Facebook and Instagram) account', href: '', action: 'Coming soon' },
  ];

  return (
    <>
      <PageHeader
        title="Account overview"
        subtitle={`${organisationName} · last 7 days · all networks`}
        actions={
          <Link href="/create" className="rounded-md bg-brand px-3 py-1.5 text-[13px] font-semibold text-white hover:bg-brand-dark">
            + Create ad
          </Link>
        }
      />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {METRICS.map((label) => (
          <Stat key={label} label={label} value="—" note="After your first ad runs" />
        ))}
      </div>

      <div className="mt-3 grid gap-3 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Section
          title="Recent campaigns"
          actions={
            <Link href="/campaigns" className="text-[12px] font-semibold text-brand">
              See all
            </Link>
          }
        >
          {campaigns && campaigns.length === 0 ? (
            <p className="text-[13px] text-mute">No campaigns yet.</p>
          ) : (
            <DataTable
              columns={['Campaign', 'Delivery', 'Results', 'Spent']}
              leftColumns={2}
              minWidth={420}
              rows={(campaigns ?? []).map((c) => [
                <Link key="n" href={`/create?campaign=${c.id}`} className="font-medium text-brand">
                  {c.name}
                </Link>,
                <Delivery key="d" effective={c.effective} />,
                '—',
                '—',
              ])}
            />
          )}
        </Section>
        <Section title="Get started" hint="Three steps to your first live ad.">
          <ol className="space-y-2">
            {steps.map((step, index) => (
              <li key={step.title} className="flex items-center gap-3 text-[13px]">
                <span
                  className={
                    'grid h-6 w-6 flex-none place-items-center rounded-full text-[12px] font-bold ' +
                    (step.done ? 'bg-ok text-white' : 'bg-soft text-mute')
                  }
                >
                  {step.done ? '✓' : index + 1}
                </span>
                <span className={'flex-1 ' + (step.done ? 'text-mute line-through' : '')}>{step.title}</span>
                {step.href && !step.done ? (
                  <Link href={step.href} className="text-[12px] font-semibold text-brand">
                    {step.action}
                  </Link>
                ) : !step.done ? (
                  <span className="text-[12px] text-mute">{step.action}</span>
                ) : null}
              </li>
            ))}
          </ol>
        </Section>
      </div>
    </>
  );
}

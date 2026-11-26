'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { useAccount } from '@/api/account';
import { api } from '@/api/client';
import { rupees } from '@/api/format';
import { errorText, unwrap } from '@/api/request';
import type { Ad, AdSet, Campaign, ConfiguredStatus, Page } from '@/api/types';
import { Delivery } from '@/components/delivery';
import { Banner, Button, Chip, DataTable, PageHeader, Select, Tabs, TextInput, Toggle } from '@/ui';

type Level = 'Campaigns' | 'Ad sets' | 'Ads';
type Row = Campaign | AdSet | Ad;
const LEVELS: Level[] = ['Campaigns', 'Ad sets', 'Ads'];
const METRICS = ['Impressions', 'Reach', 'Clicks', 'CTR', 'CPC', 'Spent'];
const THIRD: Record<Level, string> = { Campaigns: 'Goal', 'Ad sets': 'Budget', Ads: 'Version' };
const GOALS = { sales: 'Sales', traffic: 'Website visits', leads: 'Leads', awareness: 'Awareness' };
const PATHS = {
  Campaigns: '/v1/ad-accounts/{accountId}/campaigns',
  'Ad sets': '/v1/ad-accounts/{accountId}/ad-sets',
  Ads: '/v1/ad-accounts/{accountId}/ads',
} as const;

export default function CampaignsPage() {
  const { accountId, canEdit } = useAccount();
  const [level, setLevel] = useState<Level>('Campaigns');
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [adSet, setAdSet] = useState<AdSet | null>(null);
  // Rows remember the tab they were loaded for, so a tab switch never shows them under other columns.
  const [loaded, setLoaded] = useState<{ level: Level; rows: Row[] }>({ level: 'Campaigns', rows: [] });
  const rows = loaded.level === level ? loaded.rows : [];
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [show, setShow] = useState<'all' | 'active' | 'off' | 'draft'>('all');

  const load = useCallback(
    async (more: string | null) => {
      setLoading(true);
      setError('');
      const query = {
        limit: 50,
        ...(more ? { cursor: more } : {}),
        ...(level === 'Ad sets' && campaign ? { campaignId: campaign.id } : {}),
        ...(level === 'Ads' && adSet ? { adSetId: adSet.id } : {}),
      };
      try {
        const page = await unwrap<Page<Row>>(
          api.GET(PATHS[level], { params: { path: { accountId }, query } } as never),
        );
        setLoaded((existing) => ({
          level,
          rows: more && existing.level === level ? [...existing.rows, ...page.items] : page.items,
        }));
        setCursor(page.nextCursor);
      } catch (caught) {
        setError(errorText(caught));
      } finally {
        setLoading(false);
      }
    },
    [accountId, level, campaign, adSet],
  );
  useEffect(() => {
    void load(null);
  }, [load]);

  const setStatus = async (row: Row, status: ConfiguredStatus) => {
    try {
      const path = PATHS[level] + '/{id}';
      const updated = await unwrap<Row>(
        api.PATCH(path as never, { params: { path: { accountId, id: row.id } }, body: { status } } as never),
      );
      setLoaded((existing) => ({ ...existing, rows: existing.rows.map((r) => (r.id === row.id ? updated : r)) }));
    } catch (caught) {
      setError(errorText(caught));
    }
  };

  const open = (row: Row) => {
    if (level === 'Campaigns') {
      setCampaign(row as Campaign);
      setAdSet(null);
      setLevel('Ad sets');
    } else if (level === 'Ad sets') {
      setAdSet(row as AdSet);
      setLevel('Ads');
    }
  };
  const editLink = (row: Row) => {
    if (level === 'Campaigns') return `/create?campaign=${row.id}`;
    if (level === 'Ad sets') return `/create?adSet=${row.id}&step=1`;
    return `/create?ad=${row.id}&step=2`;
  };
  const third = (row: Row) => {
    if (level === 'Campaigns') return GOALS[(row as Campaign).objective];
    if (level === 'Ad sets') {
      const set = row as AdSet;
      return `${rupees(set.budget)} ${set.budgetType === 'daily' ? 'daily' : 'total'}`;
    }
    const ad = row as Ad;
    return `v${ad.current.number} · ${ad.current.reviewState.replace('_', ' ')}`;
  };

  const visible = rows.filter((row) => {
    if (search && !row.name.toLowerCase().includes(search.trim().toLowerCase())) return false;
    if (show === 'active') return row.status === 'active';
    if (show === 'off') return row.status === 'paused';
    if (show === 'draft') return row.status === 'draft';
    return row.status !== 'archived';
  });
  const tableRows = visible.map((row) => [
    <Toggle
      key="on"
      label={`Turn ${row.name} on or off`}
      checked={row.status === 'active'}
      disabled={!canEdit || row.status === 'archived'}
      onChange={(on) => void setStatus(row, on ? 'active' : 'paused')}
    />,
    <div key="name" className="text-left">
      {level === 'Ads' ? (
        <Link href={editLink(row)} className="font-medium text-brand">
          {row.name}
        </Link>
      ) : (
        <button type="button" onClick={() => open(row)} className="cursor-pointer text-left font-semibold text-brand hover:underline">
          {row.name}
        </button>
      )}
      <div className="text-[12px]">
        <Link href={editLink(row)} className="text-mute hover:text-brand">
          Edit
        </Link>
      </div>
    </div>,
    <Delivery key="delivery" effective={row.effective} />,
    third(row),
    ...METRICS.map(() => '—'),
  ]);

  return (
    <>
      <PageHeader title="Campaigns" subtitle="Campaign › Ad set › Ad, across every connected network." />
      <div className="mb-2 flex flex-wrap items-center gap-2 rounded-lg border border-line bg-white p-2">
        {canEdit ? (
          <Link href="/create" className="rounded-md bg-brand px-3 py-1.5 text-[13px] font-semibold text-white hover:bg-brand-dark">
            + Create
          </Link>
        ) : null}
        <TextInput
          aria-label="Search by name"
          className="max-w-64"
          placeholder={`Search ${level.toLowerCase()} by name`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select aria-label="Show" className="max-w-40" value={show} onChange={(e) => setShow(e.target.value as typeof show)}>
          <option value="all">All (not archived)</option>
          <option value="active">On</option>
          <option value="off">Off</option>
          <option value="draft">Drafts</option>
        </Select>
        <span className="flex-1" />
        <span className="text-[12px] text-mute">Last 7 days</span>
      </div>
      <div className="mb-2 flex flex-wrap items-center gap-3">
        <Tabs items={LEVELS} active={level} onChange={(item) => setLevel(item as Level)} />
        {campaign && level !== 'Campaigns' ? (
          <Chip onRemove={() => (setCampaign(null), setAdSet(null))}>Campaign: {campaign.name}</Chip>
        ) : null}
        {adSet && level === 'Ads' ? <Chip onRemove={() => setAdSet(null)}>Ad set: {adSet.name}</Chip> : null}
      </div>
      {error ? <Banner tone="danger">{error}</Banner> : null}
      <DataTable
        columns={['Off / On', level.replace(/s$/, ''), 'Delivery', THIRD[level], ...METRICS]}
        leftColumns={4}
        rows={tableRows}
        footer={['', `${visible.length} ${level.toLowerCase()}`, '', '', ...METRICS.map(() => '—')]}
      />
      {loading ? <p className="mt-3 text-[13px] text-mute">Loading…</p> : null}
      {!loading && visible.length === 0 ? (
        <p className="mt-3 text-[13px] text-mute">{rows.length ? 'Nothing matches these filters.' : 'Nothing here yet. Create your first ad to see it listed.'}</p>
      ) : null}
      {cursor && !loading ? (
        <div className="mt-4">
          <Button onClick={() => void load(cursor)}>Load more</Button>
        </div>
      ) : null}
      <p className="mt-4 text-[12px] text-mute">Results appear after your ads start running on a network.</p>
    </>
  );
}

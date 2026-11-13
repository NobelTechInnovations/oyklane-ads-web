'use client';

import { useState } from 'react';
import { DataTable, PageHeader, Tabs } from '@/ui';

const LEVELS = ['Campaigns', 'Ad sets', 'Ads'];
const COLUMNS: Record<string, string[]> = {
  Campaigns: ['Campaign', 'Delivery', 'Budget', 'Impressions', 'Reach', 'Clicks', 'CTR', 'CPC', 'Spent', 'Purchases'],
  'Ad sets': ['Ad set', 'Delivery', 'Budget', 'Impressions', 'Reach', 'Clicks', 'CTR', 'CPC', 'Spent', 'Purchases'],
  Ads: ['Ad', 'Delivery', 'Networks', 'Impressions', 'Reach', 'Clicks', 'CTR', 'CPC', 'Spent', 'Purchases'],
};

export default function CampaignsPage() {
  const [level, setLevel] = useState('Campaigns');
  const columns = COLUMNS[level] ?? [];
  return (
    <>
      <PageHeader title="Campaigns" />
      <div className="mb-3.5">
        <Tabs items={LEVELS} active={level} onChange={setLevel} />
      </div>
      <DataTable columns={columns} leftColumns={2} rows={[]} />
      <p className="mt-4 text-mute">Nothing here yet. Create your first ad to see it listed.</p>
    </>
  );
}

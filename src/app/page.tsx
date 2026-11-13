import Link from 'next/link';
import { Card, PageHeader, Stat } from '@/ui';

export default function HomePage() {
  return (
    <>
      <PageHeader
        title="Home"
        subtitle="Last 7 days · all networks"
        actions={
          <Link href="/create" className="rounded-lg bg-brand px-3.5 py-2 text-sm font-semibold text-white">
            Create ad
          </Link>
        }
      />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Impressions" value="—" />
        <Stat label="Reach" value="—" />
        <Stat label="Clicks" value="—" />
        <Stat label="Cost per click" value="—" />
      </div>
      <Card className="mt-7 text-mute">Numbers appear here after your first ad runs.</Card>
    </>
  );
}

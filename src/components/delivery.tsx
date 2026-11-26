import type { Effective } from '@/api/types';
import { Status } from '@/ui';

const LABELS: Record<Effective['state'], string> = {
  draft: 'Draft',
  paused: 'Off',
  archived: 'Archived',
  ended: 'Completed',
  scheduled: 'Scheduled',
  in_review: 'In review',
  rejected: 'Rejected',
  publishing: 'Publishing',
  error: 'Error',
  active: 'Active',
};
const TONES = {
  active: 'ok',
  scheduled: 'warn',
  in_review: 'warn',
  publishing: 'warn',
  rejected: 'danger',
  error: 'danger',
} as const;

/** The "Delivery" column: what is really happening, and why. */
export function Delivery({ effective }: { effective: Effective }) {
  const tone = effective.state in TONES ? TONES[effective.state as keyof typeof TONES] : 'idle';
  return (
    <div className="text-left">
      <Status tone={tone}>{LABELS[effective.state]}</Status>
      <div className="text-[13px] text-mute">{effective.reason}</div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { assetUrl } from '@/api/assets';
import type { Asset, CallToAction, Ratio } from '@/api/types';
import { Tabs } from '@/ui';

export const CTA_LABELS: Record<CallToAction, string> = {
  shop_now: 'Shop now',
  learn_more: 'Learn more',
  sign_up: 'Sign up',
  contact_us: 'Contact us',
  book_now: 'Book now',
  whatsapp: 'Send WhatsApp message',
};

const PLACEMENTS: Record<string, Ratio> = { Feed: 'portrait', Story: 'story', Square: 'square' };

function domainOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return 'your-website.com';
  }
}

/** A neutral feed and story frame, not any network's branded screen. */
export function AdPreview(props: {
  accountId: string;
  pageName: string;
  asset: Asset | null;
  primaryText: string;
  headline: string;
  description: string;
  cta: CallToAction;
  destinationUrl: string;
}) {
  const [placement, setPlacement] = useState('Feed');
  const ratio = PLACEMENTS[placement]!;
  const image = props.asset ? (
    <img src={assetUrl(props.asset, ratio)} alt="" className="h-full w-full object-cover" />
  ) : (
    <div className="grid h-full w-full place-items-center bg-soft text-sm text-mute">Add media to see it here</div>
  );
  const cta = (
    <span className="whitespace-nowrap rounded-md bg-soft px-3 py-1.5 text-sm font-semibold">{CTA_LABELS[props.cta]}</span>
  );

  return (
    <div>
      <div className="mb-3">
        <Tabs items={Object.keys(PLACEMENTS)} active={placement} onChange={setPlacement} />
      </div>
      {placement === 'Story' ? (
        <div className="relative mx-auto aspect-[9/16] w-[260px] overflow-hidden rounded-2xl bg-black text-white">
          {image}
          <div className="absolute inset-x-0 top-0 flex items-center gap-2 bg-gradient-to-b from-black/60 p-3 text-sm">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-white/90 font-bold text-ink">
              {props.pageName.slice(0, 1).toUpperCase()}
            </span>
            <b>{props.pageName}</b>
            <span className="opacity-80">Sponsored</span>
          </div>
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 p-4 text-center">
            <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-ink">{CTA_LABELS[props.cta]}</span>
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-line bg-white">
          <div className="flex items-center gap-2.5 p-3">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-brand font-bold text-white">
              {props.pageName.slice(0, 1).toUpperCase()}
            </span>
            <span className="leading-tight">
              <b className="block text-sm">{props.pageName}</b>
              <span className="text-xs text-mute">Sponsored</span>
            </span>
          </div>
          {placement === 'Feed' && props.primaryText ? (
            <p className="line-clamp-3 whitespace-pre-line px-3 pb-2.5 text-sm">{props.primaryText}</p>
          ) : null}
          <div className={ratio === 'square' ? 'aspect-square' : 'aspect-[4/5]'}>{image}</div>
          <div className="flex items-center justify-between gap-3 bg-soft/60 px-3 py-2.5">
            <span className="min-w-0">
              <span className="block truncate text-xs uppercase text-mute">{domainOf(props.destinationUrl)}</span>
              <b className="block truncate text-sm">{props.headline || 'Your headline'}</b>
              {props.description ? <span className="block truncate text-xs text-mute">{props.description}</span> : null}
            </span>
            {cta}
          </div>
        </div>
      )}
    </div>
  );
}

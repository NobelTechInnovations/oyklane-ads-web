'use client';

import { useEffect, useState } from 'react';
import { api } from '@/api/client';
import { errorText, unwrap } from '@/api/request';
import type { Objective } from '@/api/types';
import { Button, Field, Select, TextArea, TextInput } from '@/ui';

interface Suggestions {
  primaryTexts: string[];
  headlines: string[];
  descriptions: string[];
}

const LANGUAGES = [
  ['en', 'English'],
  ['hinglish', 'Hinglish'],
  ['hi', 'Hindi'],
  ['bn', 'Bengali'],
  ['ta', 'Tamil'],
  ['te', 'Telugu'],
  ['mr', 'Marathi'],
  ['gu', 'Gujarati'],
  ['kn', 'Kannada'],
  ['ml', 'Malayalam'],
  ['pa', 'Punjabi'],
] as const;
const TONES = ['friendly', 'premium', 'urgent', 'informative'] as const;

function Spark() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2l2.2 6.8L21 11l-6.8 2.2L12 20l-2.2-6.8L3 11l6.8-2.2z" fill="currentColor" />
    </svg>
  );
}

/** "Write with AI": options for the main text, headlines and descriptions, one click to use. */
export function AiWriter(props: {
  accountId: string;
  objective: Objective;
  networks: string[];
  businessName: string;
  destinationUrl: string;
  initialProduct: string;
  onUseText: (text: string) => void;
  onUseHeadline: (text: string) => void;
  onUseDescription: (text: string) => void;
}) {
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [product, setProduct] = useState(props.initialProduct);
  const [audience, setAudience] = useState('');
  const [language, setLanguage] = useState('en');
  const [tone, setTone] = useState<(typeof TONES)[number]>('friendly');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<Suggestions | null>(null);

  useEffect(() => {
    unwrap<{ enabled: boolean }>(api.GET('/v1/ai/status'))
      .then((status) => setEnabled(status.enabled))
      .catch(() => setEnabled(false));
  }, []);

  if (enabled === null) return null;
  if (!enabled) return <p className="text-[12px] text-mute">AI writing is not switched on for this account yet.</p>;

  const generate = async () => {
    setBusy(true);
    setError('');
    try {
      setResult(
        await unwrap<Suggestions>(
          api.POST('/v1/ad-accounts/{accountId}/ai/ad-copy', {
            params: { path: { accountId: props.accountId } },
            body: {
              product,
              audience,
              language,
              tone,
              objective: props.objective,
              businessName: props.businessName,
              destinationUrl: props.destinationUrl,
              networks: props.networks,
            },
          }),
        ),
      );
    } catch (caught) {
      setError(errorText(caught));
    } finally {
      setBusy(false);
    }
  };

  const group = (title: string, items: string[], use: (text: string) => void, action: string) =>
    items.length ? (
      <div className="mt-3">
        <div className="mb-1 text-[12px] font-semibold text-mute">{title}</div>
        <ul className="space-y-1">
          {items.map((text) => (
            <li key={text} className="flex items-start justify-between gap-2 rounded border border-line bg-white px-2.5 py-1.5 text-[13px]">
              <span className="whitespace-pre-line">{text}</span>
              <Button size="sm" variant="ghost" onClick={() => use(text)}>
                {action}
              </Button>
            </li>
          ))}
        </ul>
      </div>
    ) : null;

  return (
    <div>
      <Field label="What are you promoting?" htmlFor="ai-product">
        <TextArea
          id="ai-product"
          className="min-h-14"
          maxLength={500}
          value={product}
          placeholder="e.g. Handmade 925 silver rings from ₹499, free shipping across India"
          onChange={(e) => setProduct(e.target.value)}
        />
      </Field>
      <div className="grid gap-2 sm:grid-cols-[1.4fr_1fr_1fr]">
        <Field label="For whom (optional)" htmlFor="ai-audience">
          <TextInput id="ai-audience" maxLength={300} value={audience} placeholder="Young women who like jewellery" onChange={(e) => setAudience(e.target.value)} />
        </Field>
        <Field label="Language" htmlFor="ai-language">
          <Select id="ai-language" value={language} onChange={(e) => setLanguage(e.target.value)}>
            {LANGUAGES.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Tone" htmlFor="ai-tone">
          <Select id="ai-tone" value={tone} onChange={(e) => setTone(e.target.value as (typeof TONES)[number])}>
            {TONES.map((t) => (
              <option key={t} value={t}>
                {t[0]!.toUpperCase() + t.slice(1)}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <Button variant="primary" disabled={busy || product.trim().length < 3} onClick={generate}>
        <Spark />
        {busy ? 'Writing…' : result ? 'Write new options' : 'Write with AI'}
      </Button>
      {error ? <p className="mt-2 text-[12px] text-danger">{error}</p> : null}
      {result ? (
        <div className="mt-1">
          {group('Main text', result.primaryTexts, props.onUseText, 'Use')}
          {group('Headlines', result.headlines, props.onUseHeadline, 'Add')}
          {group('Descriptions', result.descriptions, props.onUseDescription, 'Use')}
          <p className="mt-2 text-[11px] text-mute">AI can make mistakes. Check prices and claims before you publish.</p>
        </div>
      ) : null}
    </div>
  );
}

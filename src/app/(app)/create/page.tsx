'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useAccount } from '@/api/account';
import { assetUrl } from '@/api/assets';
import { api } from '@/api/client';
import { fromLocalInput, microsToInput, rupees, shortDate, toLocalInput, toMicros } from '@/api/format';
import { ApiError, errorText, unwrap } from '@/api/request';
import type { Ad, AdSet, Asset, AssetIssue, CallToAction, Campaign, Location, Network, Objective } from '@/api/types';
import { AdPreview, CTA_LABELS } from '@/components/ad-preview';
import { AiWriter } from '@/components/ai-writer';
import { LocationPicker } from '@/components/location-picker';
import { MediaPicker } from '@/components/media-picker';
import { Banner, Button, Field, Modal, RadioOption, Section, Select, Status, TextArea, TextInput, Toggle } from '@/ui';

const STEPS = ['Campaign', 'Ad set', 'Ad'] as const;
const GOALS: { value: Objective; title: string; hint: string }[] = [
  { value: 'sales', title: 'Make a purchase', hint: 'Best for driving sales' },
  { value: 'traffic', title: 'Visit your website', hint: 'Best for getting people to your store' },
  { value: 'leads', title: 'Message you', hint: 'Best for WhatsApp and Instagram chats that bring leads' },
  { value: 'awareness', title: 'See your brand', hint: 'Best for awareness' },
];
const LANGUAGES = [
  ['en', 'English'],
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
const BIDS = {
  auto: 'Automatic (recommended)',
  cpc_cap: 'Cost per click limit',
  cpm: 'Cost per 1,000 impressions',
  target_cpa: 'Target cost per result',
} as const;
const AGES = Array.from({ length: 53 }, (_, i) => i + 13);

interface Ids {
  campaign: string | null;
  adSet: string | null;
  ad: string | null;
}
interface AdSetForm {
  name: string;
  networks: string[];
  budgetType: AdSet['budgetType'];
  budget: string;
  startsAt: string;
  endsAt: string;
  locations: Location[];
  ageMin: number;
  ageMax: number;
  gender: AdSet['audience']['gender'];
  languages: string[];
  bidStrategy: AdSet['bidStrategy'];
  bidAmount: string;
}
interface AdForm {
  name: string;
  primaryText: string;
  headlines: string[];
  description: string;
  cta: CallToAction;
  destinationUrl: string;
}

const NEW_AD_SET: AdSetForm = {
  name: 'Ad set 1',
  networks: [],
  budgetType: 'daily',
  budget: '500',
  startsAt: '',
  endsAt: '',
  locations: [{ type: 'country', value: 'IN', label: 'India' }],
  ageMin: 18,
  ageMax: 65,
  gender: 'all',
  languages: [],
  bidStrategy: 'auto',
  bidAmount: '',
};
const NEW_AD: AdForm = { name: 'Ad 1', primaryText: '', headlines: [''], description: '', cta: 'shop_now', destinationUrl: '' };
const goalName = (objective: Objective) => GOALS.find((g) => g.value === objective)!.title + ' campaign';

const adSetForm = (s: AdSet): AdSetForm => ({
  name: s.name,
  networks: s.networks.map((n) => n.key),
  budgetType: s.budgetType,
  budget: microsToInput(s.budget),
  startsAt: toLocalInput(s.startsAt),
  endsAt: toLocalInput(s.endsAt),
  locations: s.audience.locations,
  ageMin: s.audience.ageMin,
  ageMax: s.audience.ageMax,
  gender: s.audience.gender,
  languages: s.audience.languages,
  bidStrategy: s.bidStrategy,
  bidAmount: microsToInput(s.bidAmount),
});
const adForm = (a: Ad): AdForm => ({
  name: a.name,
  primaryText: a.current.primaryText,
  headlines: a.current.headlines.length ? a.current.headlines : [''],
  description: a.current.description,
  cta: a.current.cta,
  destinationUrl: a.current.destinationUrl,
});

function smallest(networks: Network[], key: 'maxMedia' | 'maxHeadlines' | 'headlineMaxLength' | 'primaryTextMaxLength' | 'descriptionMaxLength', fallback: number) {
  return networks.reduce((least, n) => Math.min(least, n[key]), fallback);
}

export default function CreatePage() {
  return (
    <Suspense fallback={<p className="text-mute">Loading…</p>}>
      <CreateFlow />
    </Suspense>
  );
}

function CreateFlow() {
  const router = useRouter();
  const params = useSearchParams();
  const { accountId, organisationName, canEdit } = useAccount();
  const [step, setStep] = useState(() => Math.min(2, Number(params.get('step')) || 0));
  const [ids, setIds] = useState<Ids>({ campaign: params.get('campaign'), adSet: params.get('adSet'), ad: params.get('ad') });
  const [campaign, setCampaign] = useState({ name: goalName('sales'), objective: 'sales' as Objective });
  const [adSet, setAdSet] = useState<AdSetForm>(NEW_AD_SET);
  const [ad, setAd] = useState<AdForm>(NEW_AD);
  const [media, setMedia] = useState<Asset[]>([]);
  const [catalog, setCatalog] = useState<Network[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [picking, setPicking] = useState(false);
  const [editingExisting] = useState(() => Boolean(params.get('campaign') || params.get('adSet') || params.get('ad')));

  useEffect(() => {
    let cancelled = false;
    const byId = (id: string) => ({ params: { path: { accountId, id } } });
    (async () => {
      const networks = await unwrap<{ items: Network[] }>(api.GET('/v1/networks'));
      let { campaign: campaignId, adSet: adSetId } = ids;
      if (ids.ad) {
        const loaded = await unwrap<Ad>(api.GET('/v1/ad-accounts/{accountId}/ads/{id}', byId(ids.ad)));
        adSetId = loaded.adSetId;
        const assets = await Promise.all(
          loaded.current.assetIds.map((id) => unwrap<Asset>(api.GET('/v1/ad-accounts/{accountId}/assets/{id}', byId(id)))),
        );
        if (!cancelled) (setAd(adForm(loaded)), setMedia(assets));
      }
      if (adSetId) {
        const loaded = await unwrap<AdSet>(api.GET('/v1/ad-accounts/{accountId}/ad-sets/{id}', byId(adSetId)));
        campaignId = loaded.campaignId;
        if (!cancelled) setAdSet(adSetForm(loaded));
      } else if (!cancelled) {
        setAdSet((form) => ({ ...form, networks: networks.items.map((n) => n.key) }));
      }
      if (campaignId) {
        const loaded = await unwrap<Campaign>(api.GET('/v1/ad-accounts/{accountId}/campaigns/{id}', byId(campaignId)));
        if (!cancelled) setCampaign({ name: loaded.name, objective: loaded.objective });
      }
      if (!cancelled) {
        setCatalog(networks.items);
        setIds({ campaign: campaignId, adSet: adSetId, ad: ids.ad });
      }
    })()
      .catch((caught) => !cancelled && setError(errorText(caught)))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
    // Loads once, from the address the page was opened with.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const chosen = catalog.filter((n) => adSet.networks.includes(n.key));
  const limits = {
    media: smallest(chosen, 'maxMedia', 10),
    headlines: smallest(chosen, 'maxHeadlines', 15),
    headline: smallest(chosen, 'headlineMaxLength', 255),
    text: smallest(chosen, 'primaryTextMaxLength', 2200),
    description: smallest(chosen, 'descriptionMaxLength', 255),
  };

  const go = (next: Ids, nextStep: number) => {
    setIds(next);
    setStep(nextStep);
    const query = new URLSearchParams();
    if (next.campaign) query.set('campaign', next.campaign);
    if (next.adSet) query.set('adSet', next.adSet);
    if (next.ad) query.set('ad', next.ad);
    query.set('step', String(nextStep));
    router.replace('/create?' + query.toString());
    window.scrollTo(0, 0);
  };
  const run = async (action: () => Promise<void>) => {
    setSaving(true);
    setError('');
    setNotice('');
    try {
      await action();
    } catch (caught) {
      setError(errorText(caught));
    } finally {
      setSaving(false);
    }
  };

  const saveCampaign = () =>
    run(async () => {
      const body = { name: campaign.name.trim(), objective: campaign.objective };
      const saved = ids.campaign
        ? await unwrap<Campaign>(
            api.PATCH('/v1/ad-accounts/{accountId}/campaigns/{id}', { params: { path: { accountId, id: ids.campaign } }, body }),
          )
        : await unwrap<Campaign>(api.POST('/v1/ad-accounts/{accountId}/campaigns', { params: { path: { accountId } }, body }));
      go({ ...ids, campaign: saved.id }, 1);
    });

  const saveAdSet = () =>
    run(async () => {
      const budget = toMicros(adSet.budget);
      if (!budget) throw new ApiError('Enter the budget in rupees, for example 500.', 0);
      const bidAmount = adSet.bidStrategy === 'auto' ? null : toMicros(adSet.bidAmount);
      if (adSet.bidStrategy !== 'auto' && !bidAmount) throw new ApiError('Enter the bid amount in rupees.', 0);
      const body = {
        name: adSet.name.trim(),
        budgetType: adSet.budgetType,
        budget,
        startsAt: fromLocalInput(adSet.startsAt),
        endsAt: fromLocalInput(adSet.endsAt),
        audience: {
          version: 1 as const,
          locations: adSet.locations,
          ageMin: adSet.ageMin,
          ageMax: adSet.ageMax,
          gender: adSet.gender,
          languages: adSet.languages,
          interests: [],
        },
        bidStrategy: adSet.bidStrategy,
        bidAmount,
        networks: adSet.networks.map((key) => ({ key, budgetPercent: null })),
      };
      const saved = ids.adSet
        ? await unwrap<AdSet>(api.PATCH('/v1/ad-accounts/{accountId}/ad-sets/{id}', { params: { path: { accountId, id: ids.adSet } }, body }))
        : await unwrap<AdSet>(
            api.POST('/v1/ad-accounts/{accountId}/ad-sets', { params: { path: { accountId } }, body: { ...body, campaignId: ids.campaign! } }),
          );
      go({ ...ids, adSet: saved.id }, 2);
    });

  const saveAd = (close: boolean) =>
    run(async () => {
      const body = {
        name: ad.name.trim(),
        content: {
          assetIds: media.map((asset) => asset.id),
          headlines: ad.headlines.map((h) => h.trim()).filter(Boolean),
          primaryText: ad.primaryText.trim(),
          description: ad.description.trim(),
          cta: ad.cta,
          destinationUrl: ad.destinationUrl.trim(),
          utm: {},
        },
      };
      const saved = ids.ad
        ? await unwrap<Ad>(api.PATCH('/v1/ad-accounts/{accountId}/ads/{id}', { params: { path: { accountId, id: ids.ad } }, body }))
        : await unwrap<Ad>(api.POST('/v1/ad-accounts/{accountId}/ads', { params: { path: { accountId } }, body: { ...body, adSetId: ids.adSet! } }));
      if (close) return router.push('/campaigns');
      go({ ...ids, ad: saved.id }, 2);
      setNotice(`Saved as version ${saved.current.number}.`);
    });

  const reachable = (index: number) => index === 0 || (index === 1 && ids.campaign) || (index === 2 && ids.adSet);
  const editing = (patch: Partial<AdSetForm>) => setAdSet({ ...adSet, ...patch });

  if (loading) return <p className="text-mute">Loading…</p>;

  return (
    <>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold">{editingExisting ? 'Edit ad' : 'Create ad'}</h1>
          <p className="text-[13px] text-mute">Campaign › Ad set › Ad. One setup, formatted for every network you switch on.</p>
        </div>
        <span className="text-[12px] text-mute">{ids.ad ? 'Draft saved' : ids.campaign ? 'Saving as you go' : 'Not saved yet'}</span>
      </div>

      <div className="grid gap-3 lg:grid-cols-[220px_minmax(0,1fr)] xl:grid-cols-[220px_minmax(0,1fr)_380px]">
        <nav aria-label="Steps" className="h-fit rounded-lg border border-line bg-white p-2 lg:sticky lg:top-16">
          {STEPS.map((name, index) => {
            const label = index === 0 ? campaign.name : index === 1 ? adSet.name : ad.name;
            const done = index === 0 ? ids.campaign : index === 1 ? ids.adSet : ids.ad;
            return (
              <button
                key={name}
                type="button"
                disabled={!reachable(index)}
                onClick={() => setStep(index)}
                aria-current={index === step ? 'step' : undefined}
                className={
                  'flex cursor-pointer items-start gap-2 rounded-md px-2 py-2 text-left disabled:cursor-not-allowed disabled:opacity-50 ' +
                  (index === step ? 'bg-brand/8 text-brand' : 'hover:bg-soft') +
                  [' w-full', ' ml-3 w-[calc(100%-12px)]', ' ml-6 w-[calc(100%-24px)]'][index]
                }
              >
                <span
                  className={
                    'mt-0.5 grid h-4 w-4 flex-none place-items-center rounded-full text-[10px] font-bold ' +
                    (done ? 'bg-ok text-white' : 'border border-line text-mute')
                  }
                >
                  {done ? '✓' : index + 1}
                </span>
                <span className="min-w-0">
                  <span className="block text-[11px] font-semibold uppercase tracking-wide text-mute">{name}</span>
                  <span className="block truncate text-[13px] font-medium">{label || 'Untitled'}</span>
                </span>
              </button>
            );
          })}
        </nav>

        <div>
          {!canEdit ? <Banner tone="info">Your role can view this account but not change it.</Banner> : null}

          {step === 0 ? (
            <>
              <Section title="Campaign name">
                <TextInput id="campaign-name" aria-label="Campaign name" value={campaign.name} maxLength={150} onChange={(e) => setCampaign({ ...campaign, name: e.target.value })} />
              </Section>
              <Section title="Campaign goal" hint="What do you want people to do when they see your ad?">
                <div className="grid gap-2 sm:grid-cols-2">
                {GOALS.map((item) => (
                  <RadioOption
                    key={item.value}
                    name="goal"
                    value={item.value}
                    title={item.title}
                    hint={item.hint}
                    checked={campaign.objective === item.value}
                    onChange={(value) => {
                      const objective = value as Objective;
                      const autoNamed = campaign.name === goalName(campaign.objective);
                      setCampaign({ objective, name: autoNamed ? goalName(objective) : campaign.name });
                    }}
                  />
                ))}
                </div>
              </Section>
            </>
          ) : null}

          {step === 1 ? (
            <>
              <Section title="Ad set name">
                <TextInput id="ad-set-name" aria-label="Ad set name" value={adSet.name} maxLength={150} onChange={(e) => editing({ name: e.target.value })} />
              </Section>
              <Section title="Networks" hint="Each network you switch on gets the same ad in its own formats.">
                {catalog.map((network) => (
                  <div key={network.key} className="flex items-center justify-between border-b border-line py-2 last:border-0">
                    <span className="text-[13px]">
                      <b>{network.name}</b>
                      <span className="block text-[12px] text-mute">Minimum {rupees(network.minDailyBudget)} a day</span>
                    </span>
                    <Toggle
                      label={network.name}
                      checked={adSet.networks.includes(network.key)}
                      onChange={(on) =>
                        editing({ networks: on ? [...adSet.networks, network.key] : adSet.networks.filter((k) => k !== network.key) })
                      }
                    />
                  </div>
                ))}
                <p className="mt-1 text-[12px] text-mute">Meta, Google and Oyklane stores appear here as they are connected.</p>
              </Section>

              <Section title="Audience" hint="Who should see this ad.">
                <Field label="Locations">
                  <LocationPicker value={adSet.locations} onChange={(locations) => editing({ locations })} />
                </Field>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <Field label="Age from" htmlFor="age-min">
                    <Select id="age-min" value={adSet.ageMin} onChange={(e) => editing({ ageMin: Number(e.target.value) })}>
                      {AGES.filter((a) => a <= adSet.ageMax).map((a) => (
                        <option key={a}>{a}</option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Age to" htmlFor="age-max">
                    <Select id="age-max" value={adSet.ageMax} onChange={(e) => editing({ ageMax: Number(e.target.value) })}>
                      {AGES.filter((a) => a >= adSet.ageMin).map((a) => (
                        <option key={a} value={a}>
                          {a === 65 ? '65+' : a}
                        </option>
                      ))}
                    </Select>
                  </Field>
                <Field label="Gender">
                  <div className="flex h-[30px] items-center gap-4 text-[13px]">
                    {(['all', 'female', 'male'] as const).map((g) => (
                      <label key={g} className="flex cursor-pointer items-center gap-2">
                        <input type="radio" name="gender" className="h-4 w-4 accent-ink" checked={adSet.gender === g} onChange={() => editing({ gender: g })} />
                        {g === 'all' ? 'All' : g === 'female' ? 'Women' : 'Men'}
                      </label>
                    ))}
                  </div>
                </Field>
                </div>
                <Field label="Languages" hint="None chosen means all languages.">
                  <div className="flex flex-wrap gap-2">
                    {LANGUAGES.map(([code, label]) => {
                      const on = adSet.languages.includes(code);
                      return (
                        <button
                          key={code}
                          type="button"
                          aria-pressed={on}
                          onClick={() => editing({ languages: on ? adSet.languages.filter((c) => c !== code) : [...adSet.languages, code] })}
                          className={'cursor-pointer rounded border px-2 py-0.5 text-[12px] ' + (on ? 'border-brand bg-brand text-white' : 'border-line bg-white hover:bg-soft')}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </Field>
              </Section>

              <Section title="Budget and schedule">
                <div className="mb-3 grid gap-2 sm:grid-cols-2">
                <RadioOption name="budget-type" value="daily" title="Daily budget" hint="Spend up to this each day" checked={adSet.budgetType === 'daily'} onChange={() => editing({ budgetType: 'daily' })} />
                <RadioOption
                  name="budget-type"
                  value="lifetime"
                  title="Lifetime budget"
                  hint="Spend up to this in total between the dates"
                  checked={adSet.budgetType === 'lifetime'}
                  onChange={() => editing({ budgetType: 'lifetime' })}
                />
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                <Field label={adSet.budgetType === 'daily' ? 'Daily budget (₹)' : 'Total budget (₹)'} htmlFor="budget">
                  <TextInput id="budget" inputMode="decimal" value={adSet.budget} onChange={(e) => editing({ budget: e.target.value })} />
                </Field>
                  <Field label="Start" htmlFor="starts" hint="Empty: when approved.">
                    <TextInput id="starts" type="datetime-local" value={adSet.startsAt} onChange={(e) => editing({ startsAt: e.target.value })} />
                  </Field>
                  <Field label="End" htmlFor="ends" hint={adSet.budgetType === 'lifetime' ? 'Needed for a lifetime budget.' : 'Empty: until turned off.'}>
                    <TextInput id="ends" type="datetime-local" value={adSet.endsAt} onChange={(e) => editing({ endsAt: e.target.value })} />
                  </Field>
                </div>
              </Section>

              <Section title="Bidding">
                <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Bid strategy" htmlFor="bid">
                  <Select id="bid" value={adSet.bidStrategy} onChange={(e) => editing({ bidStrategy: e.target.value as AdSetForm['bidStrategy'] })}>
                    {Object.entries(BIDS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </Select>
                </Field>
                {adSet.bidStrategy !== 'auto' ? (
                  <Field label="Amount (₹)" htmlFor="bid-amount">
                    <TextInput id="bid-amount" inputMode="decimal" value={adSet.bidAmount} onChange={(e) => editing({ bidAmount: e.target.value })} />
                  </Field>
                ) : null}
                </div>
              </Section>
            </>
          ) : null}

          {step === 2 ? (
            <>
              <Section title="Ad name">
                <TextInput id="ad-name" aria-label="Ad name" value={ad.name} maxLength={150} onChange={(e) => setAd({ ...ad, name: e.target.value })} />
              </Section>
              <Section title={`Media (up to ${limits.media})`} hint="With more images, networks show the best performing ones more often.">
                <div className="flex flex-wrap gap-2">
                  {media.map((asset) => (
                    <div key={asset.id} className="relative">
                      <img src={assetUrl(asset, 'square')} alt={asset.name} className="h-20 w-20 rounded-md border border-line object-cover" />
                      <button
                        type="button"
                        aria-label={`Remove ${asset.name}`}
                        onClick={() => setMedia(media.filter((a) => a.id !== asset.id))}
                        className="absolute -right-1.5 -top-1.5 grid h-5 w-5 cursor-pointer place-items-center rounded-full border border-line bg-white text-[12px]"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  {media.length < limits.media ? (
                    <button
                      type="button"
                      onClick={() => setPicking(true)}
                      className="grid h-20 w-20 cursor-pointer place-items-center rounded-md border border-dashed border-mute text-xl text-mute hover:bg-soft"
                      aria-label="Add media"
                    >
                      +
                    </button>
                  ) : null}
                </div>
              </Section>
              <Section
                title="Write with AI"
                hint="Describe what you sell; pick the lines you like."
              >
                <AiWriter
                  accountId={accountId}
                  objective={campaign.objective}
                  networks={adSet.networks}
                  businessName={organisationName}
                  destinationUrl={ad.destinationUrl}
                  initialProduct={campaign.name === goalName(campaign.objective) ? '' : campaign.name}
                  onUseText={(text) => setAd({ ...ad, primaryText: text.slice(0, limits.text) })}
                  onUseHeadline={(text) => {
                    const empty = ad.headlines.findIndex((h) => !h.trim());
                    if (empty >= 0) setAd({ ...ad, headlines: ad.headlines.map((h, i) => (i === empty ? text : h)) });
                    else if (ad.headlines.length < limits.headlines) setAd({ ...ad, headlines: [...ad.headlines, text] });
                    else setAd({ ...ad, headlines: [...ad.headlines.slice(0, -1), text] });
                  }}
                  onUseDescription={(text) => setAd({ ...ad, description: text.slice(0, limits.description) })}
                />
              </Section>
              <Section title="Text and link">
              <Field label="Main text" htmlFor="primary" hint={`${ad.primaryText.length} / ${limits.text}`}>
                <TextArea id="primary" value={ad.primaryText} maxLength={limits.text} placeholder="Tell people what you're offering" onChange={(e) => setAd({ ...ad, primaryText: e.target.value })} />
              </Field>
              <Field label={`Headlines (up to ${limits.headlines})`}>
                {ad.headlines.map((headline, index) => (
                  <div key={index} className="mb-2 flex gap-2">
                    <TextInput
                      aria-label={`Headline ${index + 1}`}
                      value={headline}
                      maxLength={limits.headline}
                      placeholder={`Up to ${limits.headline} characters`}
                      onChange={(e) => setAd({ ...ad, headlines: ad.headlines.map((h, i) => (i === index ? e.target.value : h)) })}
                    />
                    {ad.headlines.length > 1 ? (
                      <Button aria-label={`Remove headline ${index + 1}`} onClick={() => setAd({ ...ad, headlines: ad.headlines.filter((_, i) => i !== index) })}>
                        ×
                      </Button>
                    ) : null}
                  </div>
                ))}
                {ad.headlines.length < limits.headlines ? (
                  <button type="button" onClick={() => setAd({ ...ad, headlines: [...ad.headlines, ''] })} className="cursor-pointer text-[12px] font-semibold text-brand">
                    + Add headline
                  </button>
                ) : null}
              </Field>
              <Field label="Description" htmlFor="description" hint={`${ad.description.length} / ${limits.description}`}>
                <TextInput id="description" value={ad.description} maxLength={limits.description} onChange={(e) => setAd({ ...ad, description: e.target.value })} />
              </Field>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Call to action" htmlFor="cta">
                  <Select id="cta" value={ad.cta} onChange={(e) => setAd({ ...ad, cta: e.target.value as CallToAction })}>
                    {Object.entries(CTA_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Website link" htmlFor="url">
                  <TextInput id="url" type="url" value={ad.destinationUrl} placeholder="https://" onChange={(e) => setAd({ ...ad, destinationUrl: e.target.value })} />
                </Field>
              </div>
              </Section>
            </>
          ) : null}

          <div className="sticky bottom-0 z-10 -mx-1 mt-3 rounded-lg border border-line bg-white/95 px-3 py-2.5 shadow-[0_-2px_8px_rgba(0,0,0,0.04)] backdrop-blur">
            {error ? <Banner tone="danger">{error}</Banner> : null}
            {notice ? <Banner tone="ok">{notice}</Banner> : null}
          <div className="flex flex-wrap items-center gap-2">
            {step > 0 ? <Button onClick={() => setStep(step - 1)}>Back</Button> : null}
            {step === 0 ? (
              <Button variant="primary" disabled={!canEdit || saving} onClick={saveCampaign}>
                {saving ? 'Saving…' : 'Next: Ad set'}
              </Button>
            ) : null}
            {step === 1 ? (
              <Button variant="primary" disabled={!canEdit || saving} onClick={saveAdSet}>
                {saving ? 'Saving…' : 'Next: Ad'}
              </Button>
            ) : null}
            {step === 2 ? (
              <>
                <Button disabled={!canEdit || saving} onClick={() => saveAd(false)}>
                  Save draft
                </Button>
                <Button variant="primary" disabled={!canEdit || saving} onClick={() => saveAd(true)}>
                  {saving ? 'Saving…' : 'Save and close'}
                </Button>
              </>
            ) : null}
            {step === 2 ? <span className="text-[12px] text-mute">Submitting to networks for review comes in the next update.</span> : null}
          </div>
          </div>
        </div>

        <aside className="h-fit space-y-3 lg:col-span-2 xl:sticky xl:top-16 xl:col-span-1">
          <div className="rounded-lg border border-line bg-white p-3">
          <h2 className="mb-2 text-[14px] font-semibold">Ad preview</h2>
          <AdPreview
            accountId={accountId}
            pageName={organisationName}
            asset={media[0] ?? null}
            primaryText={ad.primaryText}
            headline={ad.headlines.find(Boolean) ?? ''}
            description={ad.description}
            cta={ad.cta}
            destinationUrl={ad.destinationUrl}
          />
          </div>
          {step === 2 ? (
            <div className="rounded-lg border border-line bg-white p-3">
              <Readiness networks={chosen} media={media} ad={ad} />
            </div>
          ) : null}
          <div className="rounded-lg border border-line bg-white p-3">
          <h2 className="text-[14px] font-semibold">Summary</h2>
          <dl className="mt-1 text-[13px]">
            <Row label="Goal">{goalName(campaign.objective).replace(' campaign', '')}</Row>
            <Row label={adSet.budgetType === 'daily' ? 'Daily budget' : 'Total budget'}>{rupees(toMicros(adSet.budget))}</Row>
            <Row label="Runs">
              {adSet.startsAt ? shortDate(fromLocalInput(adSet.startsAt)) : 'When approved'} – {adSet.endsAt ? shortDate(fromLocalInput(adSet.endsAt)) : 'until turned off'}
            </Row>
            <Row label="Audience">
              {adSet.locations.length ? adSet.locations.map((l) => l.label ?? l.value).slice(0, 2).join('; ') + (adSet.locations.length > 2 ? ` +${adSet.locations.length - 2}` : '') : 'Anywhere'}, {adSet.ageMin}–{adSet.ageMax === 65 ? '65+' : adSet.ageMax}
              {adSet.gender === 'all' ? '' : adSet.gender === 'female' ? ', women' : ', men'}
            </Row>
            <Row label="Networks">{chosen.map((n) => n.name).join(', ') || 'None yet'}</Row>
          </dl>
          </div>
        </aside>
      </div>

      {picking ? (
        <Modal title="Choose media" onClose={() => setPicking(false)} footer={<Button variant="primary" onClick={() => setPicking(false)}>Done</Button>}>
          <MediaPicker accountId={accountId} selected={media} max={limits.media} onChange={setMedia} />
        </Modal>
      ) : null}
    </>
  );
}

function Row(props: { label: string; children: ReactNode }) {
  return (
    <div className="flex justify-between gap-4 border-b border-line py-1.5 last:border-0">
      <dt className="text-mute">{props.label}</dt>
      <dd className="text-right">{props.children}</dd>
    </div>
  );
}

/** Per network: what still stops this ad, and tips. Submitting enforces the same rules. */
function Readiness(props: { networks: Network[]; media: Asset[]; ad: AdForm }) {
  if (props.networks.length === 0) return null;
  return (
    <>
      <h2 className="text-[14px] font-semibold">Ready for each network</h2>
      {props.networks.map((network) => {
        const issues: Pick<AssetIssue, 'severity' | 'message'>[] = [];
        if (props.media.length === 0) issues.push({ severity: 'error', message: 'Add at least one image.' });
        for (const asset of props.media) {
          for (const issue of asset.issues.filter((i) => i.network === network.key)) {
            issues.push({ severity: issue.severity, message: `${asset.name}: ${issue.message}` });
          }
        }
        if (!/^https:\/\/\S+\.\S+/.test(props.ad.destinationUrl)) issues.push({ severity: 'error', message: 'Add your website link (https://…).' });
        if (!props.ad.headlines.some((h) => h.trim()) && !props.ad.primaryText.trim()) {
          issues.push({ severity: 'warning', message: 'Add a headline or main text.' });
        }
        const blocking = issues.some((i) => i.severity === 'error');
        return (
          <div key={network.key} className="mt-2">
            <Status tone={blocking ? 'danger' : issues.length ? 'warn' : 'ok'}>
              <b>{network.name}</b> · {blocking ? 'Not ready' : 'Ready'}
            </Status>
            <ul className="ml-4 mt-1 space-y-1 text-[13px]">
              {issues.map((issue) => (
                <li key={issue.message} className={issue.severity === 'error' ? 'text-danger' : 'text-warn'}>
                  {issue.message}
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </>
  );
}

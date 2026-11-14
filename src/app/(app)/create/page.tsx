'use client';

import { useState } from 'react';
import { Button, Card, PageHeader, RadioOption, Section, Toggle } from '@/ui';

const STEPS = ['Campaign', 'Ad set', 'Ad'] as const;
const GOALS = [
  { value: 'sales', title: 'Make a purchase', hint: 'Best for driving sales' },
  { value: 'traffic', title: 'Visit your website', hint: 'Best for getting people to your store' },
  { value: 'leads', title: 'Message you', hint: 'Best for WhatsApp and Instagram chats that bring leads' },
  { value: 'awareness', title: 'See your brand', hint: 'Best for awareness' },
];
const NETWORKS = ['Instagram and Facebook', 'Google', 'Oyklane stores'];

export default function CreatePage() {
  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState('sales');
  const [networks, setNetworks] = useState<Record<string, boolean>>(
    Object.fromEntries(NETWORKS.map((name) => [name, true])),
  );
  const [budget, setBudget] = useState(500);
  const last = step === STEPS.length - 1;

  return (
    <>
      <PageHeader
        title="Create ad"
        subtitle="Set up the campaign, then the ad set, then the ad. We format it for every place you switch on."
      />
      <ol className="mb-8 flex flex-wrap gap-2">
        {STEPS.map((name, index) => (
          <li key={name}>
            <button
              type="button"
              onClick={() => setStep(index)}
              aria-current={index === step ? 'step' : undefined}
              className={
                'cursor-pointer rounded-full border px-4 py-1.5 text-sm font-medium ' +
                (index === step ? 'border-ink bg-ink text-white' : 'border-line text-mute')
              }
            >
              {index + 1}. {name}
            </button>
          </li>
        ))}
      </ol>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-14">
        <div>
          {step === 0 ? (
            <Section title="What do you want people to do when they see your ad?">
              {GOALS.map((item) => (
                <RadioOption
                  key={item.value}
                  name="goal"
                  value={item.value}
                  title={item.title}
                  hint={item.hint}
                  checked={goal === item.value}
                  onChange={setGoal}
                />
              ))}
            </Section>
          ) : null}

          {step === 1 ? (
            <>
              <Section title="Where it runs">
                {NETWORKS.map((name) => (
                  <div key={name} className="flex items-center justify-between py-2.5">
                    <span>{name}</span>
                    <Toggle
                      label={name}
                      checked={networks[name] ?? false}
                      onChange={(on) => setNetworks({ ...networks, [name]: on })}
                    />
                  </div>
                ))}
              </Section>
              <Section title="What's your ad budget?">
                <div className="my-3.5 rounded-2xl bg-soft px-6 py-5">
                  <b className="text-[22px]">₹ {budget.toLocaleString('en-IN')} daily</b>
                  <div className="text-mute">Runs until paused</div>
                </div>
                <label className="block font-semibold" htmlFor="budget">
                  Daily budget
                </label>
                <input
                  id="budget"
                  type="range"
                  min={100}
                  max={5000}
                  step={50}
                  value={budget}
                  onChange={(event) => setBudget(Number(event.target.value))}
                  className="mt-2 w-full accent-brand"
                />
              </Section>
            </>
          ) : null}

          {step === 2 ? (
            <Section title="Select up to 5 media" hint="With more media, we show the best performing ones more often.">
              <div className="mt-3 grid h-32 w-24 place-items-center rounded-[10px] border border-line text-2xl text-mute">
                +
              </div>
            </Section>
          ) : null}

          <div className="flex gap-3">
            {step > 0 ? <Button onClick={() => setStep(step - 1)}>Back</Button> : null}
            <Button variant="primary" disabled={last} onClick={() => setStep(step + 1)}>
              {last ? 'Publish ad (coming soon)' : 'Next: ' + STEPS[step + 1]}
            </Button>
          </div>
        </div>

        <aside className="lg:border-l lg:border-line lg:pl-12">
          <h2 className="text-lg font-bold">Preview ad</h2>
          <Card className="mt-3 grid h-56 place-items-center text-mute">Add media to see a preview</Card>
          <h2 className="mt-7 text-lg font-bold">Payment summary</h2>
          <dl className="mt-2 text-mute">
            <div className="flex justify-between py-1.5">
              <dt>Daily budget</dt>
              <dd>₹ {budget.toFixed(2)}</dd>
            </div>
            <div className="flex justify-between py-1.5">
              <dt>Estimated GST (18%)</dt>
              <dd>₹ {(budget * 0.18).toFixed(2)}</dd>
            </div>
            <div className="flex justify-between py-1.5 font-semibold text-ink">
              <dt>Estimated daily amount</dt>
              <dd>₹ {(budget * 1.18).toFixed(2)}</dd>
            </div>
          </dl>
        </aside>
      </div>
    </>
  );
}

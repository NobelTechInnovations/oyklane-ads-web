import Link from 'next/link';
import type { ReactNode } from 'react';
import { Logo } from '@/ui';

export const metadata = {
  title: 'Oyklane Ads: one ad on Meta, Google and Oyklane stores',
  description:
    'Create a campaign once and run it on Instagram, Facebook, Google and Oyklane stores. AI writes the copy; one dashboard counts every result.',
};

const NAV = [
  ['Features', '#features'],
  ['How it works', '#how'],
  ['Networks', '#networks'],
  ['FAQ', '#faq'],
];

function Pill(props: { href: string; children: ReactNode; dark?: boolean }) {
  return (
    <Link
      href={props.href}
      className={
        'inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[13px] font-bold uppercase tracking-wide ' +
        (props.dark ? 'bg-black text-white hover:bg-black/85' : 'border border-black/80 bg-white text-black hover:bg-black/5')
      }
    >
      {props.children}
    </Link>
  );
}

/** Four-point star used as decoration. */
function Star(props: { className: string }) {
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true" className={props.className}>
      <path d="M50 0 C54 38 62 46 100 50 C62 54 54 62 50 100 C46 62 38 54 0 50 C38 46 46 38 50 0Z" fill="currentColor" />
    </svg>
  );
}

function Burst(props: { className: string }) {
  const points = Array.from({ length: 24 }, (_, i) => {
    const r = i % 2 ? 40 : 50;
    const a = (Math.PI * i) / 12;
    return `${50 + r * Math.sin(a)},${50 - r * Math.cos(a)}`;
  }).join(' ');
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true" className={props.className}>
      <polygon points={points} fill="#000" />
      <polyline points="28,60 42,48 54,56 72,38" fill="none" stroke="#fff" strokeWidth="3" />
      <path d="M64 38h8v8" fill="none" stroke="#fff" strokeWidth="3" />
    </svg>
  );
}

/** A phone showing an ad, inside the hero arch. */
function PhoneAd() {
  return (
    <div className="w-[210px] rounded-[28px] border-[6px] border-black bg-white p-2 shadow-2xl">
      <div className="mb-2 flex items-center gap-2">
        <span className="grid h-6 w-6 place-items-center rounded-full bg-brand text-[10px] font-bold text-white">A</span>
        <span className="text-[10px] leading-tight">
          <b className="block">Asha Silver</b>
          <span className="text-mute">Sponsored</span>
        </span>
      </div>
      <p className="mb-2 text-[10px]">Handmade 925 silver rings. Free shipping across India.</p>
      <div className="grid aspect-[4/5] place-items-center rounded-lg bg-[linear-gradient(135deg,#0b503d,#1f7a5d)]">
        <span className="grid h-20 w-20 place-items-center rounded-full bg-lime text-[11px] font-extrabold text-brand">SILVER</span>
      </div>
      <div className="mt-2 flex items-center justify-between gap-2 rounded-md bg-soft px-2 py-1.5">
        <span className="text-[10px] font-bold">Rings from ₹499</span>
        <span className="rounded bg-white px-2 py-0.5 text-[9px] font-bold">Shop now</span>
      </div>
    </div>
  );
}

const OFFERS = [
  {
    title: 'Instagram & Facebook',
    text: 'Feed, Stories and Reels placements from the same ad, sent to your own Meta ad account.',
    icon: 'M4 6h16v12H4zM4 10h16',
  },
  {
    title: 'Google',
    text: 'Search and Display versions built from your headlines, descriptions and images.',
    icon: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14Zm9 16-4-4',
  },
  {
    title: 'Oyklane stores',
    text: 'Show your products on Oyklane stores whose owners welcome ads, next to what shoppers browse.',
    icon: 'M4 9l2-5h12l2 5M4 9v11h16V9M4 9h16M9 20v-6h6v6',
  },
];

const STEPS = [
  ['Set your goal', 'Sales, website visits, messages or awareness. One campaign holds it all.'],
  ['Choose who and where', 'Country, state and city lists, age, language and the networks to switch on.'],
  ['Let AI write, you publish', 'Pick lines AI suggests, check the preview for each network and go live.'],
];

const FAQ = [
  ['Do I need a Meta or Google account?', 'You connect your own ad accounts once. Each network bills you directly for what it spends.'],
  ['Can I use it if my store is not on Oyklane?', 'Yes. Oyklane Ads works for any seller; Oyklane merchants can open it straight from their admin.'],
  ['What does AI do?', 'It suggests main texts, headlines and descriptions that fit every network’s limits. You choose and edit.'],
  ['Which image sizes do I need?', 'Upload one image. We compress it and cut it to 1:1, 4:5, 1.91:1 and 9:16; you can adjust each crop.'],
];

export default function LandingPage() {
  return (
    <div className="bg-white text-[15px] text-black">
      <header className="sticky top-0 z-30 border-b border-black/5 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1200px] items-center gap-6 px-5">
          <Link href="/">
            <Logo />
          </Link>
          <nav className="ml-auto hidden gap-7 text-[14px] font-medium md:flex">
            {NAV.map(([label, href]) => (
              <a key={href} href={href} className="hover:text-brand">
                {label}
              </a>
            ))}
          </nav>
          <Link href="/login" className="ml-auto text-[14px] font-semibold md:ml-0">
            Log in
          </Link>
          <Pill href="/signup" dark>
            Get started
          </Pill>
        </div>
      </header>

      <section className="relative overflow-hidden bg-[radial-gradient(900px_500px_at_0%_20%,#fff1e2,transparent),radial-gradient(900px_600px_at_100%_60%,#e9e3ff,transparent),linear-gradient(#fff,#fbfaff)]">
        <div className="mx-auto grid max-w-[1200px] items-center gap-10 px-5 py-16 md:grid-cols-[1.05fr_1fr] md:py-24">
          <div>
            <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-lime px-3 py-1 text-[12px] font-bold uppercase tracking-wide text-brand">
              Ads manager for sellers
            </p>
            <h1 className="text-[42px] font-extrabold leading-[1.05] tracking-tight md:text-[60px]">
              One ad.
              <br />
              Every network.
              <br />
              <span className="text-brand">Powered by AI.</span>
            </h1>
            <p className="mt-5 max-w-[480px] text-[18px] text-black/70">
              Create a campaign once and run it on Instagram, Facebook, Google and Oyklane stores, with one place to see what
              every rupee did.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Pill href="/signup" dark>
                Start free
              </Pill>
              <Pill href="#how">See how it works</Pill>
            </div>
          </div>

          <div className="relative mx-auto h-[460px] w-full max-w-[520px]">
            <Star className="absolute left-0 top-6 h-16 w-16 text-[#1b1446]" />
            <div className="absolute bottom-0 left-10 grid h-[400px] w-[270px] place-items-center rounded-t-full bg-[#c9c2ff]">
              <PhoneAd />
            </div>
            <div className="absolute right-2 top-0 grid h-[200px] w-[200px] place-items-center rounded-full bg-[#d8d2ff]">
              <svg viewBox="0 0 64 64" className="h-20 w-20" aria-hidden="true">
                <path d="M10 26v12l30 12V14L10 26Zm0 0H6v12h4m30-24 8-6v42l-8-6M16 38l4 14h6l-3-12" fill="#fff" stroke="#000" strokeWidth="2.5" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="absolute right-[150px] top-[8px] rounded-xl border-2 border-black bg-white px-3 py-2 text-[12px] font-bold shadow-[3px_3px_0_#000]">
              +AI copy
            </div>
            <div className="absolute right-6 top-[230px] grid h-14 w-14 place-items-center rounded-full border-2 border-black bg-white text-2xl font-black">#</div>
            <Burst className="absolute bottom-6 right-0 h-36 w-36" />
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-[1200px] px-5 py-20 text-center">
        <p className="text-[13px] font-bold uppercase tracking-[0.15em] text-[#4b3fb8]">Why Oyklane Ads</p>
        <h2 className="mt-2 text-[38px] font-extrabold tracking-tight">What we offer</h2>
        <p className="mx-auto mt-2 max-w-[560px] text-black/60">Three ways to reach buyers, set up in one go.</p>
        <div id="networks" className="mt-10 grid gap-5 text-left md:grid-cols-3">
          {OFFERS.map((offer) => (
            <div key={offer.title} className="rounded-[28px] border border-black/10 bg-white p-7 shadow-[0_10px_30px_rgba(40,30,120,0.06)]">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#efeaff]">
                <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
                  <path d={offer.icon} fill="none" stroke="#0b503d" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <h3 className="mt-5 text-[21px] font-bold">{offer.title}</h3>
              <p className="mt-2 text-black/65">{offer.text}</p>
              <Link href="/signup" className="mt-5 inline-block rounded-full border border-black px-4 py-1.5 text-[12px] font-bold uppercase tracking-wide hover:bg-black hover:text-white">
                Start now
              </Link>
            </div>
          ))}
        </div>
        <p className="mx-auto mt-12 max-w-[860px] text-[20px] font-semibold leading-snug">
          Upload one image, write once, and Oyklane Ads formats it for every place your buyers scroll. AI suggests the words,
          the preview shows each placement, and one table counts impressions, reach, clicks and cost per click for all of
          them.
        </p>
      </section>

      <section className="bg-[linear-gradient(90deg,#fff7ef,#f4f0ff)]">
        <div className="mx-auto grid max-w-[1200px] gap-6 px-5 py-14 sm:grid-cols-3">
          {[
            ['3', 'networks from one ad'],
            ['4', 'image shapes made for you'],
            ['1', 'dashboard for every result'],
          ].map(([value, label], index) => (
            <div key={label} className="flex items-center justify-center gap-4">
              <svg viewBox="0 0 24 24" className="h-12 w-12" aria-hidden="true">
                <path d="M5 19 19 5M9 5h10v10" fill="none" stroke={['#14b8a6', '#6d5dfc', '#f97316'][index]} strokeWidth="2.5" strokeLinecap="round" />
              </svg>
              <div>
                <div className="text-[44px] font-extrabold leading-none">{value}</div>
                <div className="text-[14px] text-black/60">{label}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="how" className="relative overflow-hidden bg-[#0d0d12] text-white">
        <Star className="absolute left-8 top-10 h-10 w-10 text-[#c9c2ff]" />
        <Star className="absolute bottom-12 right-16 h-6 w-6 text-lime" />
        <div className="mx-auto max-w-[1200px] px-5 py-20">
          <h2 className="text-[38px] font-extrabold tracking-tight">How it works</h2>
          <p className="mt-2 max-w-[520px] text-white/60">Campaign, ad set, ad: the structure professionals use, made simple.</p>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {STEPS.map(([title, text], index) => (
              <div key={title} className="rounded-[24px] border border-white/10 bg-white/[0.04] p-6">
                <span className="text-[13px] font-bold text-lime">Step {index + 1}</span>
                <h3 className="mt-2 text-[20px] font-bold">{title}</h3>
                <p className="mt-2 text-white/65">{text}</p>
              </div>
            ))}
          </div>
          <div className="mt-10">
            <Link href="/signup" className="inline-flex rounded-full bg-white px-5 py-2.5 text-[13px] font-bold uppercase tracking-wide text-black hover:bg-lime">
              Create your first ad
            </Link>
          </div>
        </div>
      </section>

      <section id="faq" className="mx-auto max-w-[1200px] px-5 py-20">
        <p className="text-center text-[13px] font-bold uppercase tracking-[0.15em] text-[#4b3fb8]">Questions</p>
        <h2 className="mt-2 text-center text-[38px] font-extrabold tracking-tight">What sellers ask</h2>
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {FAQ.map(([question, answer]) => (
            <div key={question} className="rounded-[24px] border border-black/10 p-6">
              <h3 className="text-[17px] font-bold">{question}</h3>
              <p className="mt-2 text-black/65">{answer}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-5 pb-20">
        <div className="mx-auto flex max-w-[1200px] flex-col items-start justify-between gap-6 rounded-[32px] bg-[radial-gradient(600px_300px_at_0%_0%,#fff1e2,transparent),radial-gradient(600px_300px_at_100%_100%,#e2dbff,transparent),#faf9ff] p-10 md:flex-row md:items-center">
          <div>
            <h2 className="text-[32px] font-extrabold tracking-tight">Ready to reach more buyers?</h2>
            <p className="mt-1 text-black/65">Sign up in a minute. Oyklane sellers can open Oyklane Ads straight from their admin.</p>
          </div>
          <div className="flex gap-3">
            <Pill href="/signup" dark>
              Get started
            </Pill>
            <Pill href="/login">Log in</Pill>
          </div>
        </div>
      </section>

      <footer className="border-t border-black/10">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-4 px-5 py-8 text-[13px] text-black/60">
          <Logo />
          <span>© {new Date().getFullYear()} Oyklane. Ads for every seller.</span>
          <a href="https://oyklane.com" className="font-semibold text-black hover:text-brand">
            oyklane.com
          </a>
        </div>
      </footer>
    </div>
  );
}

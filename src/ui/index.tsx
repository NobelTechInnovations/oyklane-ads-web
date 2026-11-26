'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react';

/** "oyklane" wordmark with the Ads tag. */
export function Logo(props: { tag?: string; className?: string }) {
  return (
    <span className={'inline-flex items-center gap-1.5 ' + (props.className ?? '')}>
      <span className="text-[19px] font-extrabold tracking-tight text-brand">oyklane</span>
      <span className="rounded bg-lime px-1.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-brand">
        {props.tag ?? 'Ads'}
      </span>
    </span>
  );
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md';
  block?: boolean;
};

export function Button({ variant = 'secondary', size = 'md', block, className = '', ...rest }: ButtonProps) {
  const look =
    variant === 'primary'
      ? 'bg-brand border-brand text-white hover:bg-brand-dark'
      : variant === 'ghost'
        ? 'border-transparent bg-transparent text-brand hover:bg-soft'
        : 'bg-white border-line text-ink hover:bg-soft';
  const dimensions = size === 'sm' ? 'px-2.5 py-1 text-[12px]' : 'px-3 py-1.5 text-[13px]';
  return (
    <button
      className={
        'inline-flex items-center justify-center gap-1.5 rounded-md border font-semibold cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 ' +
        look +
        ' ' +
        dimensions +
        (block ? ' w-full py-2.5 text-sm' : '') +
        ' ' +
        className
      }
      {...rest}
    />
  );
}

export function PageHeader(props: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 className="text-xl font-bold">{props.title}</h1>
        {props.subtitle ? <p className="text-[13px] text-mute">{props.subtitle}</p> : null}
      </div>
      {props.actions ? <div className="flex items-center gap-2">{props.actions}</div> : null}
    </div>
  );
}

/** White card with a titled header: the building block of every form. */
export function Section(props: { title: string; hint?: string; actions?: ReactNode; children: ReactNode; id?: string }) {
  return (
    <section id={props.id} className="mb-3 min-w-0 rounded-lg border border-line bg-white">
      <header className="flex items-start justify-between gap-3 border-b border-line px-4 py-2.5">
        <div>
          <h2 className="text-[14px] font-semibold">{props.title}</h2>
          {props.hint ? <p className="text-[12px] text-mute">{props.hint}</p> : null}
        </div>
        {props.actions}
      </header>
      <div className="px-4 py-3">{props.children}</div>
    </section>
  );
}

export function Card(props: { children: ReactNode; className?: string }) {
  return <div className={'rounded-lg border border-line bg-white p-4 ' + (props.className ?? '')}>{props.children}</div>;
}

export function Stat(props: { label: string; value: string; note?: string }) {
  return (
    <div className="rounded-lg border border-line bg-white px-4 py-3">
      <div className="text-[12px] font-medium text-mute">{props.label}</div>
      <div className="mt-0.5 text-xl font-bold tabular-nums">{props.value}</div>
      {props.note ? <div className="text-[11px] text-mute">{props.note}</div> : null}
    </div>
  );
}

/** One choice in a radio list: title, helper line, and the radio on the left. */
export function RadioOption(props: {
  name: string;
  value: string;
  title: string;
  hint?: string;
  checked: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <label
      className={
        'flex cursor-pointer items-start gap-3 rounded-md border px-3 py-2 ' +
        (props.checked ? 'border-brand bg-brand/5' : 'border-line hover:bg-soft')
      }
    >
      <input
        type="radio"
        className="mt-0.5 h-4 w-4 flex-none accent-brand"
        name={props.name}
        value={props.value}
        checked={props.checked}
        onChange={() => props.onChange(props.value)}
      />
      <span className="text-[13px]">
        <span className="font-semibold">{props.title}</span>
        {props.hint ? <span className="block text-[12px] text-mute">{props.hint}</span> : null}
      </span>
    </label>
  );
}

export function Toggle(props: { label: string; checked: boolean; onChange: (on: boolean) => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={props.checked}
      aria-label={props.label}
      disabled={props.disabled}
      onClick={() => props.onChange(!props.checked)}
      className={
        'relative h-5 w-9 flex-none cursor-pointer rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-50 ' +
        (props.checked ? 'bg-brand' : 'bg-[#c3c9d0]')
      }
    >
      <span
        className={
          'absolute top-[2px] h-4 w-4 rounded-full bg-white shadow transition-all ' +
          (props.checked ? 'left-[18px]' : 'left-[2px]')
        }
      />
    </button>
  );
}

const STATUS_DOT = { ok: 'bg-ok', warn: 'bg-warn', idle: 'bg-[#aab2bc]', danger: 'bg-danger' };

export function Status(props: { tone: keyof typeof STATUS_DOT; children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[13px]">
      <span className={'h-2 w-2 flex-none rounded-full ' + STATUS_DOT[props.tone]} />
      {props.children}
    </span>
  );
}

/** Underlined tabs, as in classic ads managers. */
export function Tabs(props: { items: string[]; active: string; onChange: (item: string) => void }) {
  return (
    <div className="flex flex-wrap gap-1 border-b border-line">
      {props.items.map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => props.onChange(item)}
          className={
            '-mb-px cursor-pointer border-b-2 px-3 py-2 text-[13px] font-semibold ' +
            (item === props.active ? 'border-brand text-brand' : 'border-transparent text-mute hover:text-ink')
          }
        >
          {item}
        </button>
      ))}
    </div>
  );
}

/** Dense data table. The first `leftColumns` are left-aligned; the rest are numbers. */
export function DataTable(props: {
  columns: string[];
  rows: ReactNode[][];
  leftColumns?: number;
  footer?: ReactNode[];
  /** Below this width the table scrolls sideways instead of squeezing. */
  minWidth?: number;
}) {
  const left = props.leftColumns ?? 1;
  const align = (index: number) => (index < left ? 'text-left' : 'text-right');
  return (
    <div className="overflow-x-auto rounded-lg border border-line bg-white">
      <table className="w-full border-collapse text-[13px]" style={{ minWidth: props.minWidth ?? 820 }}>
        <thead>
          <tr>
            {props.columns.map((column, index) => (
              <th
                key={column + index}
                className={'whitespace-nowrap border-b border-line bg-soft px-3 py-2 text-[12px] font-semibold text-mute ' + align(index)}
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {props.rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-[#f8fafb]">
              {row.map((cell, index) => (
                <td key={index} className={'border-b border-line px-3 py-2 align-top tabular-nums ' + align(index)}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        {props.footer ? (
          <tfoot>
            <tr>
              {props.footer.map((cell, index) => (
                <td key={index} className={'bg-soft px-3 py-2 text-[12px] font-semibold ' + align(index)}>
                  {cell}
                </td>
              ))}
            </tr>
          </tfoot>
        ) : null}
      </table>
    </div>
  );
}

const INPUT =
  'w-full rounded-md border border-line bg-white px-2.5 py-1.5 text-[13px] outline-none focus:border-brand focus:ring-2 focus:ring-brand/15 disabled:bg-soft';

/** Label above a control, with an optional helper line below. */
export function Field(props: { label: string; htmlFor?: string; hint?: ReactNode; children: ReactNode }) {
  return (
    <div className="mb-3">
      <label htmlFor={props.htmlFor} className="mb-1 block text-[12px] font-semibold text-ink">
        {props.label}
      </label>
      {props.children}
      {props.hint ? <div className="mt-1 text-[12px] text-mute">{props.hint}</div> : null}
    </div>
  );
}

export function TextInput({ className = '', ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={INPUT + ' ' + className} {...rest} />;
}

export function TextArea({ className = '', ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={INPUT + ' min-h-20 ' + className} {...rest} />;
}

export function Select({ className = '', ...rest }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={INPUT + ' cursor-pointer ' + className} {...rest} />;
}

export interface Option {
  value: string;
  label: string;
}

/** Dropdown with a search box, for long lists such as states and cities. */
export function SearchSelect(props: {
  label: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  disabled?: boolean;
  loading?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const box = useRef<HTMLDivElement>(null);
  const selected = props.options.find((o) => o.value === props.value);
  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (q ? props.options.filter((o) => o.label.toLowerCase().includes(q)) : props.options).slice(0, 300);
  }, [props.options, query]);

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent) => {
      if (box.current && !box.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  const choose = (value: string) => {
    props.onChange(value);
    setOpen(false);
    setQuery('');
  };

  return (
    <div ref={box} className="relative">
      <button
        type="button"
        aria-label={props.label}
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={props.disabled}
        onClick={() => setOpen(!open)}
        className={INPUT + ' flex cursor-pointer items-center justify-between gap-2 text-left'}
      >
        <span className={'truncate ' + (selected ? '' : 'text-mute')}>
          {props.loading ? 'Loading…' : (selected?.label ?? props.placeholder)}
        </span>
        <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true" className="flex-none text-mute">
          <path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
        </svg>
      </button>
      {open ? (
        <div className="absolute z-30 mt-1 w-full min-w-[220px] rounded-md border border-line bg-white shadow-lg">
          <div className="border-b border-line p-1.5">
            <input
              autoFocus
              value={query}
              placeholder="Search"
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Escape') setOpen(false);
                if (event.key === 'Enter' && shown[0]) {
                  event.preventDefault();
                  choose(shown[0].value);
                }
              }}
              className={INPUT}
            />
          </div>
          <ul role="listbox" aria-label={props.label} className="max-h-64 overflow-y-auto py-1">
            {shown.map((option) => (
              <li key={option.value}>
                <button
                  type="button"
                  role="option"
                  aria-selected={option.value === props.value}
                  onClick={() => choose(option.value)}
                  className={
                    'block w-full cursor-pointer px-3 py-1.5 text-left text-[13px] hover:bg-soft ' +
                    (option.value === props.value ? 'font-semibold text-brand' : '')
                  }
                >
                  {option.label}
                </button>
              </li>
            ))}
            {shown.length === 0 ? <li className="px-3 py-2 text-[13px] text-mute">No matches</li> : null}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

const BANNER = {
  danger: 'border-danger/30 bg-danger/5 text-danger',
  info: 'border-line bg-white text-ink',
  ok: 'border-ok/30 bg-ok/5 text-ok',
};

export function Banner(props: { tone: keyof typeof BANNER; children: ReactNode }) {
  return (
    <div
      role={props.tone === 'danger' ? 'alert' : 'status'}
      className={'mb-3 rounded-md border px-3 py-2 text-[13px] ' + BANNER[props.tone]}
    >
      {props.children}
    </div>
  );
}

/** Small removable tag, e.g. a chosen location. */
export function Chip(props: { children: ReactNode; onRemove?: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded border border-line bg-soft px-2 py-0.5 text-[12px]">
      {props.children}
      {props.onRemove ? (
        <button type="button" aria-label="Remove" onClick={props.onRemove} className="cursor-pointer px-0.5 text-mute hover:text-ink">
          ×
        </button>
      ) : null}
    </span>
  );
}

/** Centred dialog over a dimmed page. Escape or the close button closes it. */
export function Modal(props: { title: string; onClose: () => void; children: ReactNode; footer?: ReactNode }) {
  const { onClose } = props;
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={props.title}
        onClick={(event) => event.stopPropagation()}
        className="flex max-h-[90vh] w-full max-w-[820px] flex-col rounded-lg bg-white shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
          <h2 className="text-[15px] font-semibold">{props.title}</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="cursor-pointer text-xl leading-none text-mute">
            ×
          </button>
        </div>
        <div className="overflow-y-auto px-4 py-3">{props.children}</div>
        {props.footer ? <div className="flex justify-end gap-2 border-t border-line px-4 py-2.5">{props.footer}</div> : null}
      </div>
    </div>
  );
}

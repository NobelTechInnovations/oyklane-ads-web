'use client';

import { useEffect } from 'react';
import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary';
  block?: boolean;
};

export function Button({ variant = 'secondary', block, className = '', ...rest }: ButtonProps) {
  const look =
    variant === 'primary'
      ? 'bg-brand border-brand text-white hover:opacity-90'
      : 'bg-white border-line text-ink hover:bg-soft';
  const size = block ? 'w-full py-4 text-base rounded-[10px]' : 'px-3.5 py-2 text-sm rounded-lg';
  return (
    <button
      className={'border font-semibold cursor-pointer disabled:opacity-50 ' + look + ' ' + size + ' ' + className}
      {...rest}
    />
  );
}

export function PageHeader(props: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold">{props.title}</h1>
        {props.subtitle ? <p className="mt-1 text-mute">{props.subtitle}</p> : null}
      </div>
      {props.actions}
    </div>
  );
}

export function Section(props: { title: string; hint?: string; children: ReactNode }) {
  return (
    <section className="mb-11">
      <h2 className="text-lg font-bold">{props.title}</h2>
      {props.hint ? <p className="text-mute">{props.hint}</p> : null}
      <div className="mt-2">{props.children}</div>
    </section>
  );
}

export function Card(props: { children: ReactNode; className?: string }) {
  return (
    <div className={'rounded-xl border border-line p-4 ' + (props.className ?? '')}>
      {props.children}
    </div>
  );
}

export function Stat(props: { label: string; value: string }) {
  return (
    <Card>
      <div className="text-sm text-mute">{props.label}</div>
      <div className="mt-1 text-2xl font-bold tabular-nums">{props.value}</div>
    </Card>
  );
}

/** One choice in a radio list: title, helper line, and the radio on the right. */
export function RadioOption(props: {
  name: string;
  value: string;
  title: string;
  hint?: string;
  checked: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 py-3.5">
      <span>
        {props.title}
        {props.hint ? <span className="block text-sm text-mute">{props.hint}</span> : null}
      </span>
      <input
        type="radio"
        className="h-5 w-5 flex-none accent-ink"
        name={props.name}
        value={props.value}
        checked={props.checked}
        onChange={() => props.onChange(props.value)}
      />
    </label>
  );
}

export function Toggle(props: {
  label: string;
  checked: boolean;
  onChange: (on: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={props.checked}
      aria-label={props.label}
      disabled={props.disabled}
      onClick={() => props.onChange(!props.checked)}
      className={
        'relative h-6 w-10 flex-none cursor-pointer rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-50 ' +
        (props.checked ? 'bg-brand' : 'bg-[#c9ced5]')
      }
    >
      <span
        className={
          'absolute top-[3px] h-[18px] w-[18px] rounded-full bg-white transition-all ' +
          (props.checked ? 'left-[19px]' : 'left-[3px]')
        }
      />
    </button>
  );
}

const STATUS_DOT = { ok: 'bg-ok', warn: 'bg-warn', idle: 'bg-[#aab2bc]', danger: 'bg-danger' };

export function Status(props: { tone: keyof typeof STATUS_DOT; children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 text-sm">
      <span className={'h-2 w-2 rounded-full ' + STATUS_DOT[props.tone]} />
      {props.children}
    </span>
  );
}

export function Tabs(props: { items: string[]; active: string; onChange: (item: string) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {props.items.map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => props.onChange(item)}
          className={
            'cursor-pointer rounded-full border px-3 py-1 text-sm ' +
            (item === props.active ? 'border-ink text-ink' : 'border-line text-mute')
          }
        >
          {item}
        </button>
      ))}
    </div>
  );
}

/** Dense data table. First column is left-aligned text; the rest are right-aligned numbers. */
export function DataTable(props: { columns: string[]; rows: ReactNode[][]; leftColumns?: number }) {
  const left = props.leftColumns ?? 1;
  const align = (index: number) => (index < left ? 'text-left' : 'text-right');
  return (
    <div className="overflow-x-auto rounded-xl border border-line">
      <table className="w-full min-w-[760px] border-collapse">
        <thead>
          <tr>
            {props.columns.map((column, index) => (
              <th
                key={column}
                className={'bg-soft px-3.5 py-2.5 text-[13px] font-semibold text-mute ' + align(index)}
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {props.rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, index) => (
                <td
                  key={index}
                  className={'border-t border-line px-3.5 py-3 tabular-nums ' + align(index)}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const INPUT =
  'w-full rounded-lg border border-line bg-white px-3 py-2 outline-none focus:border-brand disabled:bg-soft';

/** Label above a control, with an optional helper line below. */
export function Field(props: { label: string; htmlFor?: string; hint?: ReactNode; children: ReactNode }) {
  return (
    <div className="mb-4">
      <label htmlFor={props.htmlFor} className="mb-1.5 block text-sm font-semibold">
        {props.label}
      </label>
      {props.children}
      {props.hint ? <div className="mt-1 text-[13px] text-mute">{props.hint}</div> : null}
    </div>
  );
}

export function TextInput({ className = '', ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={INPUT + ' ' + className} {...rest} />;
}

export function TextArea({ className = '', ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={INPUT + ' min-h-24 ' + className} {...rest} />;
}

export function Select({ className = '', ...rest }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={INPUT + ' cursor-pointer ' + className} {...rest} />;
}

const BANNER = {
  danger: 'border-danger/30 bg-danger/5 text-danger',
  info: 'border-line bg-soft text-ink',
  ok: 'border-ok/30 bg-ok/5 text-ok',
};

export function Banner(props: { tone: keyof typeof BANNER; children: ReactNode }) {
  return (
    <div role={props.tone === 'danger' ? 'alert' : 'status'} className={'mb-4 rounded-lg border px-4 py-3 text-sm ' + BANNER[props.tone]}>
      {props.children}
    </div>
  );
}

/** Small removable tag, e.g. a chosen location. */
export function Chip(props: { children: ReactNode; onRemove?: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-soft px-3 py-1 text-sm">
      {props.children}
      {props.onRemove ? (
        <button type="button" aria-label="Remove" onClick={props.onRemove} className="cursor-pointer text-mute hover:text-ink">
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
        className="flex max-h-[90vh] w-full max-w-[820px] flex-col rounded-xl bg-white shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
          <h2 className="text-lg font-bold">{props.title}</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="cursor-pointer text-2xl leading-none text-mute">
            ×
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-4">{props.children}</div>
        {props.footer ? <div className="flex justify-end gap-3 border-t border-line px-5 py-3.5">{props.footer}</div> : null}
      </div>
    </div>
  );
}

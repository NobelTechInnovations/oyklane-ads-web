const MICROS_PER_PAISA = BigInt(10_000);
const PAISE_PER_RUPEE = BigInt(100);

/** "500000000" micros → "₹500". */
export function rupees(micros: string | null | undefined): string {
  if (micros === null || micros === undefined) return '—';
  const paise = Number(BigInt(micros) / MICROS_PER_PAISA);
  return '₹' + (paise / 100).toLocaleString('en-IN', { maximumFractionDigits: 2 });
}

/** "500" or "499.50" → micros, or null if it is not an amount. */
export function toMicros(value: string): string | null {
  const match = /^(\d{1,12})(?:\.(\d{1,2}))?$/.exec(value.trim().replaceAll(',', ''));
  if (!match) return null;
  const paise = BigInt(match[1]!) * PAISE_PER_RUPEE + BigInt((match[2] ?? '').padEnd(2, '0'));
  return (paise * MICROS_PER_PAISA).toString();
}

/** Micros → the plain number shown in an input, e.g. "499.5". */
export function microsToInput(micros: string | null): string {
  if (!micros) return '';
  const paise = BigInt(micros) / MICROS_PER_PAISA;
  const whole = paise / PAISE_PER_RUPEE;
  const rest = paise % PAISE_PER_RUPEE;
  return rest === BigInt(0) ? whole.toString() : `${whole}.${rest.toString().padStart(2, '0')}`;
}

/** ISO time → value for <input type="datetime-local">, in the browser's time zone. */
export function toLocalInput(iso: string | null): string {
  if (!iso) return '';
  const date = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export const fromLocalInput = (value: string) => (value ? new Date(value).toISOString() : null);

export function shortDate(iso: string | null): string {
  if (!iso) return '';
  return new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });
}

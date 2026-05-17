import type { PackPayload } from './api/projects';
import type { BillingMode } from './types';

/* Estat de formulari d'una venda/pack (inputs com a string, com la resta
   de formularis del projecte). El pare posseeix aquest estat (v-model). */
export interface PackFormState {
  mode: BillingMode;
  hours: string;
  priceEuros: string;
  rateEuros: string;
  reason: string;
}

export function emptyPackState(reason = 'Venda inicial'): PackFormState {
  return { mode: 'fixed', hours: '', priceEuros: '', rateEuros: '20', reason };
}

export function packIsValid(s: PackFormState): boolean {
  if (!s.reason.trim()) return false;
  if (s.mode === 'hourly') return Number(s.hours) > 0 && Number(s.rateEuros) > 0;
  return Number(s.priceEuros) > 0;
}

export function packTotalCents(s: PackFormState): number | null {
  if (s.mode === 'hourly') {
    const h = Number(s.hours);
    const r = Number(s.rateEuros);
    if (s.hours.trim() === '' || s.rateEuros.trim() === '' || !(h > 0) || !(r >= 0)) return null;
    return Math.round(h * r * 100);
  }
  if (s.priceEuros.trim() === '') return null;
  const p = Number(s.priceEuros);
  return p >= 0 ? Math.round(p * 100) : null;
}

export function buildPackPayload(s: PackFormState): PackPayload {
  const reason = s.reason.trim() || (s.mode === 'fixed' ? 'Venda inicial' : 'Ampliació');
  if (s.mode === 'hourly') {
    return {
      billing_mode: 'hourly',
      hours: Number(s.hours),
      hourly_rate_cents: Math.round(Number(s.rateEuros) * 100),
      currency: 'EUR',
      reason,
    };
  }
  const payload: PackPayload = {
    billing_mode: 'fixed',
    price_cents: Math.round(Number(s.priceEuros) * 100),
    currency: 'EUR',
    reason,
  };
  if (s.hours.trim() !== '') payload.hours = Number(s.hours);
  return payload;
}

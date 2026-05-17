import { http } from '@/shared/http/client';
import type { Money } from '@/modules/projects/types';

export interface SettingsData { shadow_rate: Money; }

export async function getSettings(): Promise<SettingsData> {
  const { data } = await http.get<{ data: SettingsData }>('/api/settings');
  return data.data;
}
export async function updateShadowRate(cents: number, currency = 'EUR'): Promise<SettingsData> {
  const { data } = await http.patch<{ data: SettingsData }>('/api/settings', { shadow_rate_cents: cents, currency });
  return data.data;
}

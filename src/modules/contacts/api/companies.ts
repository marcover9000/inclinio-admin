import { http } from '@/shared/http/client';
import type { Company, Paginated } from '../types';

export interface ListCompaniesParams {
  page?: number;
  search?: string;
  is_client?: boolean;
}

function nullifyEmptyStrings<T extends Record<string, unknown>>(payload: T): T {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(payload)) {
    out[k] = v === '' ? null : v;
  }
  return out as T;
}

export async function listCompanies(params: ListCompaniesParams = {}): Promise<Paginated<Company>> {
  const { data } = await http.get<Paginated<Company>>('/api/companies', { params });
  return data;
}

export async function getCompany(id: number): Promise<Company> {
  const { data } = await http.get<{ data: Company }>(`/api/companies/${id}`);
  return data.data;
}

export async function updateCompany(id: number, payload: Partial<Company>): Promise<Company> {
  const { data } = await http.patch<{ data: Company }>(`/api/companies/${id}`, nullifyEmptyStrings(payload));
  return data.data;
}

export async function deleteCompany(id: number): Promise<void> {
  await http.delete(`/api/companies/${id}`);
}

import { http } from '@/shared/http/client';
import { nullifyEmptyStrings } from '@/shared/http/payload';
import type { Company, Paginated } from '../types';

export interface ListCompaniesParams {
  page?: number;
  search?: string;
  is_client?: boolean;
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

export interface CreateCompanyPayload {
  name: string;
  vat?: string;
  website?: string;
  address?: string;
  notes?: string;
}

export async function createCompany(payload: CreateCompanyPayload): Promise<Company> {
  const { data } = await http.post<{ data: Company }>('/api/companies', payload);
  return data.data;
}

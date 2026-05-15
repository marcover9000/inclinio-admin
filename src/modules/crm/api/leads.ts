import { http } from '@/shared/http/client';
import type { Lead, LeadStatus, Paginated } from '../types';

export interface ListLeadsParams {
  page?: number;
  status?: LeadStatus[];
  tags?: string[];
  search?: string;
  with_trashed?: boolean;
}

export async function listLeads(params: ListLeadsParams = {}): Promise<Paginated<Lead>> {
  const queryParams: Record<string, string | number> = {};
  if (params.page) queryParams.page = params.page;
  if (params.status?.length) queryParams.status = params.status.join(',');
  if (params.tags?.length) queryParams.tags = params.tags.join(',');
  if (params.search) queryParams.search = params.search;
  if (params.with_trashed) queryParams.with_trashed = 1;
  const { data } = await http.get<Paginated<Lead>>('/api/leads', { params: queryParams });
  return data;
}

export async function getLead(id: number): Promise<Lead> {
  const { data } = await http.get<{ data: Lead }>(`/api/leads/${id}`);
  return data.data;
}

export interface CreateLeadPayload {
  person_id?: number;
  person?: { first_name: string; last_name?: string; email?: string; phone?: string; position?: string };
  company?: { name: string; vat?: string; website?: string; address?: string };
  lead: { message: string; tags?: string[] };
}

export async function createLead(payload: CreateLeadPayload): Promise<Lead> {
  const { data } = await http.post<{ data: Lead }>('/api/leads', payload);
  return data.data;
}

export async function updateLead(id: number, payload: { message?: string; tags?: string[] }): Promise<Lead> {
  const { data } = await http.patch<{ data: Lead }>(`/api/leads/${id}`, payload);
  return data.data;
}

export async function deleteLead(id: number): Promise<void> {
  await http.delete(`/api/leads/${id}`);
}

export async function transitionLeadStatus(id: number, status: LeadStatus): Promise<Lead> {
  const { data } = await http.patch<{ data: Lead }>(`/api/leads/${id}/status`, { status });
  return data.data;
}

import { http } from '@/shared/http/client';
import type { Paginated, Person } from '../types';

export interface ListPeopleParams {
  page?: number;
  search?: string;
  is_client?: boolean;
  company_id?: number;
}

function nullifyEmptyStrings<T extends Record<string, unknown>>(payload: T): T {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(payload)) {
    out[k] = v === '' ? null : v;
  }
  return out as T;
}

export async function listPeople(params: ListPeopleParams = {}): Promise<Paginated<Person>> {
  const { data } = await http.get<Paginated<Person>>('/api/people', { params });
  return data;
}

export async function getPerson(id: number): Promise<Person> {
  const { data } = await http.get<{ data: Person }>(`/api/people/${id}`);
  return data.data;
}

export type UpdatePersonPayload = Partial<Person> & { company_id?: number | null };

export async function updatePerson(id: number, payload: UpdatePersonPayload): Promise<Person> {
  const { data } = await http.patch<{ data: Person }>(`/api/people/${id}`, nullifyEmptyStrings(payload));
  return data.data;
}

export async function deletePerson(id: number): Promise<void> {
  await http.delete(`/api/people/${id}`);
}

export interface CreatePersonPayload {
  first_name: string;
  last_name?: string;
  email?: string;
  phone?: string;
  position?: string;
  company_id?: number;
}

export async function createPerson(payload: CreatePersonPayload): Promise<Person> {
  const { data } = await http.post<{ data: Person }>('/api/people', payload);
  return data.data;
}

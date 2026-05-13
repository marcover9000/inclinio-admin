import { http } from '@/shared/http/client';
import type { Paginated, Person } from '../types';

export interface ListPeopleParams {
  page?: number;
  search?: string;
  is_client?: boolean;
  company_id?: number;
}

export async function listPeople(params: ListPeopleParams = {}): Promise<Paginated<Person>> {
  const { data } = await http.get<Paginated<Person>>('/api/people', { params });
  return data;
}

export async function getPerson(id: number): Promise<Person> {
  const { data } = await http.get<{ data: Person }>(`/api/people/${id}`);
  return data.data;
}

export async function updatePerson(id: number, payload: Partial<Person>): Promise<Person> {
  const { data } = await http.patch<{ data: Person }>(`/api/people/${id}`, payload);
  return data.data;
}

export async function deletePerson(id: number): Promise<void> {
  await http.delete(`/api/people/${id}`);
}

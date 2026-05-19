import { http } from '@/shared/http/client';
import type { BillingMode, DashboardTime, Paginated, Project, ProjectStatus, TimeEntry } from '../types';

export interface ListProjectsParams {
  page?: number;
  status?: ProjectStatus[];
  client_company_id?: number;
  client_person_id?: number;
  is_internal?: boolean;
  search?: string;
  with_trashed?: boolean;
}

export async function listProjects(params: ListProjectsParams = {}): Promise<Paginated<Project>> {
  const q: Record<string, string | number> = {};
  if (params.page) q.page = params.page;
  if (params.status?.length) q.status = params.status.join(',');
  if (params.client_company_id) q.client_company_id = params.client_company_id;
  if (params.client_person_id) q.client_person_id = params.client_person_id;
  if (params.is_internal !== undefined) q.is_internal = params.is_internal ? 1 : 0;
  if (params.search) q.search = params.search;
  if (params.with_trashed) q.with_trashed = 1;
  const { data } = await http.get<Paginated<Project>>('/api/projects', { params: q });
  return data;
}

export async function getProject(id: number): Promise<Project> {
  const { data } = await http.get<{ data: Project }>(`/api/projects/${id}`);
  return data.data;
}

export interface PackPayload {
  billing_mode: BillingMode;
  currency: string;
  reason: string;
  dated_on?: string;
  hours?: number;            // hourly: obligatori · fixed: estimació opcional
  price_cents?: number;      // fixed
  hourly_rate_cents?: number; // hourly
}

export interface CreateProjectPayload {
  name: string;
  is_internal: boolean;
  client_company_id?: number | null;
  client_person_id?: number | null;
  shadow_rate_override_cents?: number | null;
  shadow_rate_override_currency?: string | null;
  started_at?: string | null;
  due_at?: string | null;
  pack?: PackPayload;
}

export async function createProject(payload: CreateProjectPayload): Promise<Project> {
  const { data } = await http.post<{ data: Project }>('/api/projects', payload);
  return data.data;
}

export async function updateProject(
  id: number,
  payload: Partial<Pick<CreateProjectPayload, 'name' | 'is_internal' | 'client_company_id' | 'client_person_id' | 'started_at' | 'due_at' | 'shadow_rate_override_cents' | 'shadow_rate_override_currency'>>,
): Promise<Project> {
  const { data } = await http.patch<{ data: Project }>(`/api/projects/${id}`, payload);
  return data.data;
}

export async function deleteProject(id: number): Promise<void> {
  await http.delete(`/api/projects/${id}`);
}

export async function changeProjectStatus(id: number, status: ProjectStatus): Promise<Project> {
  const { data } = await http.patch<{ data: Project }>(`/api/projects/${id}/status`, { status });
  return data.data;
}

export async function addHoursPack(projectId: number, pack: PackPayload): Promise<Project> {
  const { data } = await http.post<{ data: Project }>(`/api/projects/${projectId}/packs`, pack);
  return data.data;
}

export async function updateHoursPack(projectId: number, packId: number, pack: PackPayload): Promise<Project> {
  const { data } = await http.patch<{ data: Project }>(`/api/projects/${projectId}/packs/${packId}`, pack);
  return data.data;
}

export async function deleteHoursPack(projectId: number, packId: number): Promise<void> {
  await http.delete(`/api/projects/${projectId}/packs/${packId}`);
}

export interface ConvertLeadPayload {
  mode: 'new' | 'extend';
  name?: string;
  project_id?: number;
  pack: PackPayload;
}

export async function convertLeadToProject(leadId: number, payload: ConvertLeadPayload): Promise<Project> {
  const { data } = await http.post<{ data: Project }>(`/api/leads/${leadId}/project`, payload);
  return data.data;
}

export interface TaskPayload { title: string; status?: string; estimate_hours?: number | null; }
export interface TimeEntryPayload { worked_on: string; minutes: number; description: string; task_id?: number | null; }

export async function createTask(projectId: number, p: TaskPayload): Promise<Project> {
  const { data } = await http.post<{ data: Project }>(`/api/projects/${projectId}/tasks`, p);
  return data.data;
}
export async function updateTask(projectId: number, taskId: number, p: TaskPayload): Promise<Project> {
  const { data } = await http.patch<{ data: Project }>(`/api/projects/${projectId}/tasks/${taskId}`, p);
  return data.data;
}
export async function deleteTask(projectId: number, taskId: number): Promise<void> {
  await http.delete(`/api/projects/${projectId}/tasks/${taskId}`);
}
export async function createTimeEntry(projectId: number, p: TimeEntryPayload): Promise<Project> {
  const { data } = await http.post<{ data: Project }>(`/api/projects/${projectId}/time-entries`, p);
  return data.data;
}
export async function updateTimeEntry(projectId: number, id: number, p: Partial<TimeEntryPayload>): Promise<Project> {
  const { data } = await http.patch<{ data: Project }>(`/api/projects/${projectId}/time-entries/${id}`, p);
  return data.data;
}
export async function deleteTimeEntry(projectId: number, id: number): Promise<void> {
  await http.delete(`/api/projects/${projectId}/time-entries/${id}`);
}

export interface MyTimeEntriesParams { from?: string; to?: string; project_id?: number; task_id?: number; }

export async function listMyTimeEntries(params: MyTimeEntriesParams = {}): Promise<TimeEntry[]> {
  const q: Record<string, string | number> = {};
  if (params.from) q.from = params.from;
  if (params.to) q.to = params.to;
  if (params.project_id) q.project_id = params.project_id;
  if (params.task_id) q.task_id = params.task_id;
  const { data } = await http.get<{ data: TimeEntry[] }>('/api/time-entries', { params: q });
  return data.data;
}

export interface DashboardTimeParams { from?: string; to?: string; }

export async function getDashboardTime(params: DashboardTimeParams = {}): Promise<DashboardTime> {
  const q: Record<string, string> = {};
  if (params.from) q.from = params.from;
  if (params.to) q.to = params.to;
  const { data } = await http.get<{ data: DashboardTime }>('/api/dashboard/time', { params: q });
  return data.data;
}

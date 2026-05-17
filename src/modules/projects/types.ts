import type { Person, Company, Paginated } from '@/modules/contacts/types';

export type ProjectStatus = 'active' | 'paused' | 'done' | 'archived';

export type BillingMode = 'fixed' | 'hourly';

export interface Money {
  cents: number;
  currency: string;
  formatted: string;
}

export interface HoursPack {
  id: number;
  project_id: number;
  billing_mode: BillingMode;
  hours: number | null;
  price: Money;
  hourly_rate: Money | null;
  dated_on: string | null;
  reason: string;
  source_lead_id: number | null;
  created_at: string;
}

export interface Project {
  id: number;
  name: string;
  status: ProjectStatus;
  status_label: string;
  is_internal: boolean;
  client_company_id: number | null;
  client_person_id: number | null;
  client_company: Company | null;
  client_person: Person | null;
  shadow_rate_override: Money | null;
  total_price: Money;
  budgeted_hours: number;
  started_at: string | null;
  due_at: string | null;
  hours_packs?: HoursPack[];
  aggregates?: ProjectAggregates;
  tasks?: Task[];
  time_entries?: TimeEntry[];
  created_at: string;
  updated_at: string;
}

export type { Paginated };

export const PROJECT_STATUSES: readonly ProjectStatus[] = [
  'active', 'paused', 'done', 'archived',
];

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  active: 'Actiu',
  paused: 'En pausa',
  done: 'Acabat',
  archived: 'Arxivat',
};

// Mateix graf que ProjectStatus::canTransitionTo al backend (spec §6).
export const VALID_PROJECT_TRANSITIONS: Record<ProjectStatus, ProjectStatus[]> = {
  active: ['paused', 'done'],
  paused: ['active', 'done'],
  done: ['archived', 'active'],
  archived: ['active'],
};

export type TaskStatus = 'todo' | 'doing' | 'done';

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  todo: 'Per fer',
  doing: 'En curs',
  done: 'Feta',
};

export interface Task {
  id: number;
  project_id: number;
  title: string;
  status: TaskStatus;
  status_label: string;
  estimate_hours: number | null;
  consumed_hours: number;
  created_at: string;
}

export interface TimeEntry {
  id: number;
  project_id: number;
  task_id: number | null;
  worked_on: string | null;
  minutes: number;
  description: string;
  created_at: string;
  project?: { id: number; name: string };
  task?: { id: number; title: string } | null;
}

export interface ProjectAggregates {
  consumed_hours: number;
  overrun_percent: number | null;
  theoretical_cost: Money;
  real_margin: Money | null;
  shadow_rate: Money;
}

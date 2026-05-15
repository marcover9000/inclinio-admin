import type { Person, Company, Paginated } from '../contacts/types';

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'proposal' | 'won' | 'lost';
export type LeadSource = 'web_form' | 'manual';

export interface Lead {
  id: number;
  status: LeadStatus;
  source: LeadSource;
  message: string | null;
  tags: string[];
  status_changed_at: string;
  created_at: string;
  updated_at: string;
  person: Person;
  company: Company | null;
  notes?: LeadNote[];
}

export interface LeadNote {
  id: number;
  body: string;
  created_at: string;
  author: { id: number; name: string };
}

export type { Paginated };

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  new: 'Nou',
  contacted: 'Contactat',
  qualified: 'Qualificat',
  proposal: 'Proposta',
  won: 'Guanyat',
  lost: 'Perdut',
};

export const VALID_TRANSITIONS: Record<LeadStatus, LeadStatus[]> = {
  new: ['contacted', 'lost'],
  contacted: ['qualified', 'lost'],
  qualified: ['proposal', 'lost'],
  proposal: ['won', 'lost'],
  won: [],
  lost: [],
};

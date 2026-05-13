import { http } from '@/shared/http/client';
import type { LeadNote } from '../types';

export async function addLeadNote(leadId: number, body: string): Promise<LeadNote> {
  const { data } = await http.post<{ data: LeadNote }>(`/api/leads/${leadId}/notes`, { body });
  return data.data;
}

export async function deleteLeadNote(noteId: number): Promise<void> {
  await http.delete(`/api/notes/${noteId}`);
}

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getLead, updateLead, deleteLead, transitionLeadStatus } from '../api/leads';
import { addLeadNote, deleteLeadNote } from '../api/leadNotes';
import type { Lead, LeadStatus } from '../types';
import { extractErrorMessage } from '@/shared/http/errors';
import AppShell from '@/shared/components/AppShell.vue';
import SubmitButton from '@/shared/components/form/SubmitButton.vue';
import ConfirmDialog from '@/shared/components/ui/ConfirmDialog.vue';
import DangerButton from '@/shared/components/ui/DangerButton.vue';
import NotFoundFallback from '@/shared/components/ui/NotFoundFallback.vue';
import LeadStatusBadge from '../components/LeadStatusBadge.vue';
import LeadStatusSelector from '../components/LeadStatusSelector.vue';
import LeadNoteList from '../components/LeadNoteList.vue';
import LeadNoteForm from '../components/LeadNoteForm.vue';

const route = useRoute();
const router = useRouter();
const lead = ref<Lead | null>(null);
const errorMsg = ref<string | null>(null);
const showDelete = ref(false);
const pendingTransition = ref<LeadStatus | null>(null);

const showConvertModal = computed(() => pendingTransition.value === 'won');
const showSimpleConfirm = computed(() => pendingTransition.value !== null && pendingTransition.value !== 'won');

async function load() {
  errorMsg.value = null;
  try {
    lead.value = await getLead(Number(route.params.id));
  } catch (e) {
    errorMsg.value = (e as { response?: { status?: number } })?.response?.status === 404
      ? 'Aquest registre no existeix o ha estat eliminat.'
      : extractErrorMessage(e, 'No s\'ha pogut carregar el registre.');
    console.error(e);
  }
}

function onSelectStatus(next: LeadStatus) {
  pendingTransition.value = next;
}

async function confirmTransition() {
  if (!lead.value || !pendingTransition.value) return;
  await transitionLeadStatus(lead.value.id, pendingTransition.value);
  pendingTransition.value = null;
  await load();
}

async function saveLead() {
  if (!lead.value) return;
  await updateLead(lead.value.id, {
    message: lead.value.message ?? undefined,
    tags: lead.value.tags,
  });
  await load();
}

async function destroy() {
  if (!lead.value) return;
  await deleteLead(lead.value.id);
  router.push('/leads');
}

async function onAddNote(body: string) {
  if (!lead.value) return;
  await addLeadNote(lead.value.id, body);
  await load();
}

async function onDeleteNote(noteId: number) {
  await deleteLeadNote(noteId);
  await load();
}

onMounted(load);
</script>

<template>
  <AppShell>
    <NotFoundFallback v-if="errorMsg && !lead" :message="errorMsg" back-to="/leads" back-label="Tornar al llistat" />
    <div class="space-y-6 p-6" v-if="lead">
      <header class="flex items-start justify-between">
        <div>
          <h1 class="text-2xl font-semibold">{{ lead.person?.full_name ?? '(persona eliminada)' }}</h1>
          <p v-if="lead.company" class="text-sm text-neutral-500">{{ lead.company.name }}</p>
        </div>
        <div class="flex items-center gap-3">
          <LeadStatusBadge :status="lead.status" />
          <LeadStatusSelector :current="lead.status" @select="onSelectStatus" />
        </div>
      </header>

      <section class="rounded border border-neutral-200 p-4">
        <h2 class="mb-2 text-lg font-medium">Missatge inicial</h2>
        <p class="whitespace-pre-wrap text-sm text-neutral-700">{{ lead.message || '—' }}</p>
        <p class="mt-3 text-xs text-neutral-500">Origen: {{ lead.source }}</p>
      </section>

      <section class="rounded border border-neutral-200 p-4">
        <h2 class="mb-2 text-lg font-medium">Tags</h2>
        <input
          :value="lead.tags.join(', ')"
          @change="lead.tags = (($event.target as HTMLInputElement).value).split(',').map(t => t.trim()).filter(Boolean)"
          class="w-full rounded border-neutral-300"
          placeholder="web, seo, …"
        />
        <SubmitButton class="mt-2" @click="saveLead">Desar canvis</SubmitButton>
      </section>

      <section class="rounded border border-neutral-200 p-4">
        <h2 class="mb-3 text-lg font-medium">Notes ({{ lead.notes?.length ?? 0 }})</h2>
        <LeadNoteForm @submit="onAddNote" />
        <hr class="my-3" />
        <LeadNoteList :notes="lead.notes ?? []" @delete="onDeleteNote" />
      </section>

      <div class="flex justify-end">
        <DangerButton @click="showDelete = true">Eliminar Lead</DangerButton>
      </div>

      <ConfirmDialog
        :open="showConvertModal"
        title="Marcar com a Guanyat"
        :message="`Això promocionarà ${lead.person?.full_name ?? 'la persona'}${lead.company ? ' i ' + lead.company.name : ''} a Client. Continuar?`"
        @confirm="confirmTransition"
        @cancel="pendingTransition = null"
      />

      <ConfirmDialog
        :open="showSimpleConfirm"
        title="Canviar estat"
        :message="`Vols canviar l'estat a ${pendingTransition}?`"
        @confirm="confirmTransition"
        @cancel="pendingTransition = null"
      />

      <ConfirmDialog
        :open="showDelete"
        title="Eliminar Lead"
        message="Es farà soft-delete. Es pot recuperar via tinker si cal."
        danger
        @confirm="destroy"
        @cancel="showDelete = false"
      />
    </div>
  </AppShell>
</template>

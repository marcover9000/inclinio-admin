<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getLead, updateLead, deleteLead, transitionLeadStatus } from '../api/leads';
import { addLeadNote, deleteLeadNote } from '../api/leadNotes';
import type { Lead, LeadStatus } from '../types';
import { extractErrorMessage } from '@/shared/http/errors';
import { useAsyncAction } from '@/shared/composables/useAsyncAction';
import AppShell from '@/shared/components/AppShell.vue';
import Button from '@/shared/components/ui/Button.vue';
import Card from '@/shared/components/ui/Card.vue';
import PageHeader from '@/shared/components/ui/PageHeader.vue';
import ConfirmDialog from '@/shared/components/ui/ConfirmDialog.vue';
import AlertMessage from '@/shared/components/ui/AlertMessage.vue';
import NotFoundFallback from '@/shared/components/ui/NotFoundFallback.vue';
import Badge from '@/shared/components/ui/Badge.vue';
import LeadStatusBadge from '../components/LeadStatusBadge.vue';
import LeadStatusSelector from '../components/LeadStatusSelector.vue';
import LeadNoteList from '../components/LeadNoteList.vue';
import LeadNoteForm from '../components/LeadNoteForm.vue';
import ConvertLeadToProjectCard from '@/modules/projects/components/ConvertLeadToProjectCard.vue';
import TextField from '@/shared/components/form/TextField.vue';

const route = useRoute();
const router = useRouter();
const lead = ref<Lead | null>(null);
const loadError = ref<string | null>(null);
const showDelete = ref(false);
const pendingTransition = ref<LeadStatus | null>(null);

// Bug latent corregit: abans aquests handlers no tenien try/catch i els
// errors es perdien silenciosament. Ara es mostren a l'usuari via AlertMessage.
const { run, loading, errorMsg: actionError } = useAsyncAction();
const errorMsg = computed(() => actionError.value ?? loadError.value);

const showConvertModal = computed(() => pendingTransition.value === 'won');
const showSimpleConfirm = computed(() => pendingTransition.value !== null && pendingTransition.value !== 'won');

async function load() {
  loadError.value = null;
  try {
    lead.value = await getLead(Number(route.params.id));
  } catch (e) {
    loadError.value = (e as { response?: { status?: number } })?.response?.status === 404
      ? 'Aquest registre no existeix o ha estat eliminat.'
      : extractErrorMessage(e, 'No s\'ha pogut carregar el registre.');
    console.error(e);
  }
}

function onSelectStatus(next: LeadStatus) {
  pendingTransition.value = next;
}

function confirmTransition() {
  if (!lead.value || !pendingTransition.value) return;
  return run(async () => {
    await transitionLeadStatus(lead.value!.id, pendingTransition.value!);
    pendingTransition.value = null;
    await load();
  }, 'No s\'ha pogut canviar l\'estat.');
}

function saveLead() {
  if (!lead.value) return;
  return run(async () => {
    await updateLead(lead.value!.id, {
      message: lead.value!.message ?? undefined,
      tags: lead.value!.tags,
    });
    await load();
  }, 'No s\'han pogut desar els canvis.');
}

function destroy() {
  if (!lead.value) return;
  return run(async () => {
    await deleteLead(lead.value!.id);
    router.push('/leads');
  }, 'No s\'ha pogut eliminar el lead.');
}

function onAddNote(body: string) {
  if (!lead.value) return;
  return run(async () => {
    await addLeadNote(lead.value!.id, body);
    await load();
  }, 'No s\'ha pogut afegir la nota.');
}

function onDeleteNote(noteId: number) {
  return run(async () => {
    await deleteLeadNote(noteId);
    await load();
  }, 'No s\'ha pogut eliminar la nota.');
}

onMounted(load);
</script>

<template>
  <AppShell>
    <NotFoundFallback v-if="errorMsg && !lead" :message="errorMsg" back-to="/leads" back-label="Tornar al llistat" />
    <template v-if="lead">
      <PageHeader
        :title="lead.person?.full_name ?? '(persona eliminada)'"
        :subtitle="lead.company?.name"
      >
        <template #badge>
          <LeadStatusBadge :status="lead.status" />
        </template>
        <template #actions>
          <LeadStatusSelector :current="lead.status" @select="onSelectStatus" />
          <Button variant="danger" @click="showDelete = true">Eliminar Lead</Button>
        </template>
      </PageHeader>

      <AlertMessage v-if="errorMsg" variant="error" :message="errorMsg" />

      <Card title="Missatge inicial">
        <p class="whitespace-pre-wrap text-sm text-neutral-700">{{ lead.message || '—' }}</p>
        <p class="mt-3 text-xs text-neutral-500">Origen: {{ lead.source }}</p>
      </Card>

      <Card title="Tags">
        <form @submit.prevent="saveLead" class="space-y-3">
          <div class="flex flex-wrap gap-1">
            <Badge v-for="tag in lead.tags" :key="tag" tone="neutral">{{ tag }}</Badge>
          </div>
          <TextField
            :model-value="lead.tags.join(', ')"
            @update:model-value="lead.tags = $event.split(',').map((t: string) => t.trim()).filter(Boolean)"
            label="Tags (separats per coma)"
            placeholder="web, seo, …"
          />
          <div class="flex justify-end">
            <Button type="submit" variant="primary" :loading="loading">Desar canvis</Button>
          </div>
        </form>
      </Card>

      <Card :title="`Notes (${lead.notes?.length ?? 0})`">
        <LeadNoteForm @submit="onAddNote" />
        <hr class="my-3" />
        <LeadNoteList :notes="lead.notes ?? []" @delete="onDeleteNote" />
      </Card>

      <ConvertLeadToProjectCard v-if="lead.status === 'won'" :lead="lead" />

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
    </template>
  </AppShell>
</template>

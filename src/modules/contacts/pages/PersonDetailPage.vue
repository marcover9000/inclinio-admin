<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute, useRouter, RouterLink } from 'vue-router';
import { getPerson, updatePerson, deletePerson } from '../api/people';
import type { Person } from '../types';
import type { Lead } from '@/modules/crm/types';
import AppShell from '@/shared/components/AppShell.vue';
import TextField from '@/shared/components/form/TextField.vue';
import SubmitButton from '@/shared/components/form/SubmitButton.vue';
import ConfirmDialog from '@/shared/components/ui/ConfirmDialog.vue';
import AlertMessage from '@/shared/components/ui/AlertMessage.vue';
import ClientBadge from '../components/ClientBadge.vue';
import LeadStatusBadge from '@/modules/crm/components/LeadStatusBadge.vue';

type PersonWithLeads = Person & { leads?: Lead[] };

const route = useRoute();
const router = useRouter();
const person = ref<PersonWithLeads | null>(null);
const loading = ref(false);
const errorMsg = ref<string | null>(null);
const showDelete = ref(false);

async function load() {
  errorMsg.value = null;
  try {
    person.value = await getPerson(Number(route.params.id)) as PersonWithLeads;
  } catch (e: any) {
    errorMsg.value = e?.response?.status === 404
      ? 'Aquest registre no existeix o ha estat eliminat.'
      : (e?.response?.data?.message ?? 'No s\'ha pogut carregar el registre.');
    console.error(e);
  }
}

async function save() {
  if (!person.value) return;
  loading.value = true;
  errorMsg.value = null;
  try {
    person.value = await updatePerson(person.value.id, {
      first_name: person.value.first_name,
      last_name: person.value.last_name,
      email: person.value.email,
      phone: person.value.phone,
      position: person.value.position,
    }) as PersonWithLeads;
  } catch (e: any) {
    errorMsg.value = e?.response?.data?.message ?? 'No s\'han pogut desar els canvis.';
    console.error(e);
  } finally {
    loading.value = false;
  }
}

async function destroy() {
  if (!person.value) return;
  errorMsg.value = null;
  try {
    await deletePerson(person.value.id);
    router.push('/people');
  } catch (e: any) {
    showDelete.value = false;
    errorMsg.value = e?.response?.data?.message ?? 'No s\'ha pogut eliminar.';
    console.error(e);
  }
}

onMounted(load);
</script>

<template>
  <AppShell>
    <div class="space-y-4 p-6" v-if="errorMsg && !person">
      <AlertMessage variant="error" :message="errorMsg" />
      <RouterLink to="/people" class="text-sm text-blue-600 hover:underline">← Tornar al llistat</RouterLink>
    </div>
    <div class="space-y-4 p-6" v-if="person">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-semibold">{{ person.full_name }}</h1>
        <ClientBadge v-if="person.is_client" :since="person.became_client_at" />
      </div>
      <AlertMessage v-if="errorMsg" variant="error" :message="errorMsg" />
      <form @submit.prevent="save" class="grid grid-cols-2 gap-4">
        <TextField v-model="person.first_name" label="Nom" />
        <TextField :model-value="person.last_name ?? ''" @update:model-value="v => person!.last_name = v" label="Cognoms" />
        <TextField :model-value="person.email ?? ''" @update:model-value="v => person!.email = v" label="Email" />
        <TextField :model-value="person.phone ?? ''" @update:model-value="v => person!.phone = v" label="Telèfon" />
        <TextField :model-value="person.position ?? ''" @update:model-value="v => person!.position = v" label="Càrrec" />
        <div class="col-span-2 flex items-center gap-3">
          <SubmitButton :loading="loading">Desar canvis</SubmitButton>
          <button type="button" @click="showDelete = true" class="rounded border border-red-300 bg-white px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200">Eliminar</button>
        </div>
      </form>

      <section class="rounded border border-gray-200 p-4">
        <header class="mb-3 flex items-center justify-between">
          <h2 class="text-lg font-medium">Leads ({{ person.leads?.length ?? 0 }})</h2>
          <RouterLink :to="`/leads/new?personId=${person.id}`" class="rounded bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700">+ Nou lead per aquesta persona</RouterLink>
        </header>
        <p v-if="!person.leads?.length" class="text-sm text-gray-500">Aquesta persona encara no té cap lead.</p>
        <div v-else class="space-y-2">
          <RouterLink
            v-for="lead in person.leads"
            :key="lead.id"
            :to="`/leads/${lead.id}`"
            class="flex items-center justify-between rounded border border-gray-200 p-3 hover:bg-gray-50"
          >
            <div>
              <p class="text-sm font-medium">{{ lead.message?.slice(0, 80) ?? '(sense missatge)' }}<span v-if="lead.message && lead.message.length > 80">…</span></p>
              <p class="text-xs text-gray-500">{{ new Date(lead.created_at).toLocaleDateString('ca-ES') }} · Origen: {{ lead.source }}</p>
            </div>
            <LeadStatusBadge :status="lead.status" />
          </RouterLink>
        </div>
      </section>

      <ConfirmDialog
        :open="showDelete"
        title="Eliminar persona"
        :message="`Estàs segur que vols eliminar ${person.full_name}? (soft-delete)`"
        danger
        @confirm="destroy"
        @cancel="showDelete = false"
      />
    </div>
  </AppShell>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute, useRouter, RouterLink } from 'vue-router';
import { getPerson, updatePerson, deletePerson } from '../api/people';
import { listCompanies } from '../api/companies';
import type { Company, Person } from '../types';
import type { Lead } from '@/modules/crm/types';
import { extractErrorMessage } from '@/shared/http/errors';
import AppShell from '@/shared/components/AppShell.vue';
import TextField from '@/shared/components/form/TextField.vue';
import SubmitButton from '@/shared/components/form/SubmitButton.vue';
import ConfirmDialog from '@/shared/components/ui/ConfirmDialog.vue';
import AlertMessage from '@/shared/components/ui/AlertMessage.vue';
import DangerButton from '@/shared/components/ui/DangerButton.vue';
import NotFoundFallback from '@/shared/components/ui/NotFoundFallback.vue';
import ClientBadge from '../components/ClientBadge.vue';
import LeadCardRow from '@/modules/crm/components/LeadCardRow.vue';

type PersonWithLeads = Person & { leads?: Lead[] };

const route = useRoute();
const router = useRouter();
const person = ref<PersonWithLeads | null>(null);
const loading = ref(false);
const errorMsg = ref<string | null>(null);
const showDelete = ref(false);

const editCompanyId = ref<number | null>(null);
const editCompanyName = ref<string>('');
const companySuggestions = ref<Company[]>([]);

async function load() {
  errorMsg.value = null;
  try {
    person.value = await getPerson(Number(route.params.id)) as PersonWithLeads;
    editCompanyId.value = person.value.company?.id ?? null;
    editCompanyName.value = person.value.company?.name ?? '';
    companySuggestions.value = [];
  } catch (e) {
    errorMsg.value = (e as { response?: { status?: number } })?.response?.status === 404
      ? 'Aquest registre no existeix o ha estat eliminat.'
      : extractErrorMessage(e, 'No s\'ha pogut carregar el registre.');
    console.error(e);
  }
}

async function searchCompanies() {
  if (!editCompanyName.value) {
    companySuggestions.value = [];
    return;
  }
  const result = await listCompanies({ search: editCompanyName.value });
  companySuggestions.value = result.data.slice(0, 5);
}

function pickCompany(c: Company) {
  editCompanyId.value = c.id;
  editCompanyName.value = c.name;
  companySuggestions.value = [];
}

function clearCompany() {
  editCompanyId.value = null;
  editCompanyName.value = '';
  companySuggestions.value = [];
}

async function save() {
  if (!person.value) return;
  loading.value = true;
  errorMsg.value = null;
  try {
    await updatePerson(person.value.id, {
      first_name: person.value.first_name,
      last_name: person.value.last_name,
      email: person.value.email,
      phone: person.value.phone,
      position: person.value.position,
      company_id: editCompanyId.value,
    });
    await load();
  } catch (e) {
    errorMsg.value = extractErrorMessage(e, 'No s\'han pogut desar els canvis.');
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
  } catch (e) {
    showDelete.value = false;
    errorMsg.value = extractErrorMessage(e, 'No s\'ha pogut eliminar.');
    console.error(e);
  }
}

onMounted(load);
</script>

<template>
  <AppShell>
    <NotFoundFallback v-if="errorMsg && !person" :message="errorMsg" back-to="/people" back-label="Tornar al llistat" />
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
        <div class="col-span-2 relative">
          <p class="text-sm font-medium text-neutral-700 mb-1">Empresa</p>
          <div v-if="editCompanyId !== null" class="flex items-center gap-2">
            <span class="rounded bg-neutral-100 px-3 py-1.5 text-sm">{{ editCompanyName }}</span>
            <button type="button" @click="clearCompany" class="text-xs text-danger-600 hover:underline">Desvincular</button>
          </div>
          <div v-else class="relative">
            <input
              v-model="editCompanyName"
              @input="searchCompanies"
              placeholder="Cerca empresa…"
              class="w-full rounded border-neutral-300 focus:ring-2 focus:ring-brand-500"
            />
            <ul v-if="companySuggestions.length" class="absolute z-10 mt-1 w-full rounded border bg-white shadow">
              <li v-for="c in companySuggestions" :key="c.id" @click="pickCompany(c)" class="cursor-pointer p-2 text-sm hover:bg-neutral-100">
                {{ c.name }}<span v-if="c.is_client" class="ml-2 text-xs text-success-600">(client)</span>
              </li>
            </ul>
          </div>
        </div>
        <div class="col-span-2 flex items-center gap-3">
          <SubmitButton :loading="loading">Desar canvis</SubmitButton>
          <DangerButton @click="showDelete = true">Eliminar</DangerButton>
        </div>
      </form>

      <section class="rounded border border-neutral-200 p-4">
        <header class="mb-3 flex items-center justify-between">
          <h2 class="text-lg font-medium">Leads ({{ person.leads?.length ?? 0 }})</h2>
          <RouterLink :to="`/leads/new?personId=${person.id}`" class="rounded bg-brand-600 px-3 py-1.5 text-sm text-white hover:bg-brand-700">+ Nou lead per aquesta persona</RouterLink>
        </header>
        <p v-if="!person.leads?.length" class="text-sm text-neutral-500">Aquesta persona encara no té cap lead.</p>
        <div v-else class="space-y-2">
          <LeadCardRow v-for="lead in person.leads" :key="lead.id" :lead="lead" />
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

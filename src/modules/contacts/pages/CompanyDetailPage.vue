<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute, useRouter, RouterLink } from 'vue-router';
import { getCompany, updateCompany, deleteCompany } from '../api/companies';
import { listPeople, updatePerson } from '../api/people';
import type { Company, Person } from '../types';
import type { Lead } from '@/modules/crm/types';
import AppShell from '@/shared/components/AppShell.vue';
import TextField from '@/shared/components/form/TextField.vue';
import TextareaField from '@/shared/components/form/TextareaField.vue';
import SubmitButton from '@/shared/components/form/SubmitButton.vue';
import ConfirmDialog from '@/shared/components/ui/ConfirmDialog.vue';
import AlertMessage from '@/shared/components/ui/AlertMessage.vue';
import DangerButton from '@/shared/components/ui/DangerButton.vue';
import NotFoundFallback from '@/shared/components/ui/NotFoundFallback.vue';
import ClientBadge from '../components/ClientBadge.vue';
import LeadCardRow from '@/modules/crm/components/LeadCardRow.vue';

type CompanyWithRelations = Company & { people?: Person[]; leads?: Lead[] };

const route = useRoute();
const router = useRouter();
const company = ref<CompanyWithRelations | null>(null);
const loading = ref(false);
const errorMsg = ref<string | null>(null);
const showDelete = ref(false);

const showAddPerson = ref(false);
const personSearchQuery = ref('');
const personSuggestions = ref<Person[]>([]);
const searchingPersons = ref(false);

async function load() {
  errorMsg.value = null;
  try {
    company.value = await getCompany(Number(route.params.id)) as CompanyWithRelations;
  } catch (e: any) {
    errorMsg.value = e?.response?.status === 404
      ? 'Aquest registre no existeix o ha estat eliminat.'
      : (e?.response?.data?.message ?? 'No s\'ha pogut carregar el registre.');
    console.error(e);
  }
}

async function save() {
  if (!company.value) return;
  loading.value = true;
  errorMsg.value = null;
  try {
    company.value = await updateCompany(company.value.id, {
      name: company.value.name,
      vat: company.value.vat,
      website: company.value.website,
      address: company.value.address,
      notes: company.value.notes,
    }) as CompanyWithRelations;
  } catch (e: any) {
    errorMsg.value = e?.response?.data?.message ?? 'No s\'han pogut desar els canvis.';
    console.error(e);
  } finally {
    loading.value = false;
  }
}

async function destroy() {
  if (!company.value) return;
  errorMsg.value = null;
  try {
    await deleteCompany(company.value.id);
    router.push('/companies');
  } catch (e: any) {
    showDelete.value = false;
    errorMsg.value = e?.response?.data?.message ?? 'No s\'ha pogut eliminar.';
    console.error(e);
  }
}

async function searchPersons() {
  if (!personSearchQuery.value) {
    personSuggestions.value = [];
    return;
  }
  searchingPersons.value = true;
  try {
    const result = await listPeople({ search: personSearchQuery.value });
    personSuggestions.value = result.data
      .filter(p => p.company?.id !== company.value?.id)
      .slice(0, 8);
  } finally {
    searchingPersons.value = false;
  }
}

async function attachPerson(p: Person) {
  if (!company.value) return;
  try {
    await updatePerson(p.id, { company_id: company.value.id });
    cancelAddPerson();
    await load();
  } catch (e: any) {
    errorMsg.value = e?.response?.data?.message ?? 'No s\'ha pogut associar la persona.';
    console.error(e);
  }
}

function cancelAddPerson() {
  showAddPerson.value = false;
  personSearchQuery.value = '';
  personSuggestions.value = [];
}

async function detachPerson(p: Person) {
  if (!company.value) return;
  try {
    await updatePerson(p.id, { company_id: null });
    await load();
  } catch (e: any) {
    errorMsg.value = e?.response?.data?.message ?? 'No s\'ha pogut desvincular la persona.';
    console.error(e);
  }
}

onMounted(load);
</script>

<template>
  <AppShell>
    <NotFoundFallback v-if="errorMsg && !company" :message="errorMsg" back-to="/companies" back-label="Tornar al llistat" />
    <div class="space-y-4 p-6" v-if="company">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-semibold">{{ company.name }}</h1>
        <ClientBadge v-if="company.is_client" :since="company.became_client_at" />
      </div>
      <AlertMessage v-if="errorMsg" variant="error" :message="errorMsg" />
      <form @submit.prevent="save" class="grid grid-cols-2 gap-4">
        <TextField v-model="company.name" label="Nom" />
        <TextField :model-value="company.vat ?? ''" @update:model-value="v => company!.vat = v" label="VAT/CIF" />
        <TextField :model-value="company.website ?? ''" @update:model-value="v => company!.website = v" label="Web" />
        <TextField :model-value="company.address ?? ''" @update:model-value="v => company!.address = v" label="Adreça" />
        <div class="col-span-2">
          <TextareaField :model-value="company.notes ?? ''" @update:model-value="v => company!.notes = v" label="Notes" :rows="5" />
        </div>
        <div class="col-span-2 flex items-center gap-3">
          <SubmitButton :loading="loading">Desar canvis</SubmitButton>
          <DangerButton @click="showDelete = true">Eliminar</DangerButton>
        </div>
      </form>

      <section class="rounded border border-neutral-200 p-4">
        <header class="flex items-center justify-between mb-3">
          <h2 class="text-lg font-medium">Persones ({{ company.people?.length ?? 0 }})</h2>
          <button v-if="!showAddPerson" type="button" @click="showAddPerson = true" class="rounded bg-brand-600 px-3 py-1.5 text-sm text-white hover:bg-brand-700">
            + Afegir persona
          </button>
        </header>

        <div v-if="showAddPerson" class="mb-4 rounded border border-brand-200 bg-brand-50 p-3">
          <div class="flex items-center justify-between mb-2">
            <p class="text-sm font-medium">Afegir persona existent</p>
            <button type="button" @click="cancelAddPerson" class="text-xs text-neutral-600 hover:underline">Cancel·lar</button>
          </div>
          <div class="relative">
            <input
              v-model="personSearchQuery"
              @input="searchPersons"
              placeholder="Cerca per nom o email…"
              class="w-full rounded border-neutral-300 focus:ring-2 focus:ring-brand-500"
            />
            <ul v-if="personSuggestions.length" class="absolute z-10 mt-1 w-full rounded border bg-white shadow max-h-60 overflow-auto">
              <li v-for="p in personSuggestions" :key="p.id" @click="attachPerson(p)" class="cursor-pointer p-2 text-sm hover:bg-neutral-100">
                {{ p.full_name }}<span v-if="p.email" class="ml-2 text-xs text-neutral-500">{{ p.email }}</span>
                <span v-if="p.company" class="ml-2 text-xs text-accent-600">(actualment a {{ p.company.name }})</span>
              </li>
            </ul>
            <p v-if="personSearchQuery && personSuggestions.length === 0 && !searchingPersons" class="mt-2 text-xs text-neutral-500">
              No s'ha trobat cap persona. <RouterLink :to="`/people/new?companyId=${company.id}`" class="text-brand-600 hover:underline">Crear nova</RouterLink>
            </p>
          </div>
        </div>

        <p v-if="!company.people?.length" class="text-sm text-neutral-500">Aquesta empresa encara no té persones associades.</p>
        <div v-else class="space-y-2">
          <div v-for="p in company.people" :key="p.id" class="flex items-center justify-between rounded border border-neutral-200 p-3 hover:bg-neutral-50">
            <RouterLink :to="`/people/${p.id}`" class="flex-1">
              <p class="text-sm font-medium">{{ p.full_name }}</p>
              <p v-if="p.email" class="text-xs text-neutral-500">{{ p.email }}</p>
            </RouterLink>
            <div class="flex items-center gap-3">
              <ClientBadge v-if="p.is_client" :since="p.became_client_at" />
              <button type="button" @click="detachPerson(p)" class="text-xs text-danger-600 hover:underline">Desvincular</button>
            </div>
          </div>
        </div>
      </section>

      <section class="rounded border border-neutral-200 p-4">
        <h2 class="mb-3 text-lg font-medium">Leads ({{ company.leads?.length ?? 0 }})</h2>
        <p v-if="!company.leads?.length" class="text-sm text-neutral-500">Aquesta empresa encara no té cap lead.</p>
        <div v-else class="space-y-2">
          <LeadCardRow v-for="lead in company.leads" :key="lead.id" :lead="lead" />
        </div>
      </section>

      <ConfirmDialog
        :open="showDelete"
        title="Eliminar empresa"
        :message="`Estàs segur que vols eliminar ${company.name}? (soft-delete)`"
        danger
        @confirm="destroy"
        @cancel="showDelete = false"
      />
    </div>
  </AppShell>
</template>

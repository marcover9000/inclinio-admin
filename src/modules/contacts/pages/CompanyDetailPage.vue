<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute, useRouter, RouterLink } from 'vue-router';
import { getCompany, updateCompany, deleteCompany } from '../api/companies';
import type { Company, Person } from '../types';
import type { Lead } from '@/modules/crm/types';
import AppShell from '@/shared/components/AppShell.vue';
import TextField from '@/shared/components/form/TextField.vue';
import TextareaField from '@/shared/components/form/TextareaField.vue';
import SubmitButton from '@/shared/components/form/SubmitButton.vue';
import ConfirmDialog from '@/shared/components/ui/ConfirmDialog.vue';
import AlertMessage from '@/shared/components/ui/AlertMessage.vue';
import ClientBadge from '../components/ClientBadge.vue';
import LeadStatusBadge from '@/modules/crm/components/LeadStatusBadge.vue';

type CompanyWithRelations = Company & { people?: Person[]; leads?: Lead[] };

const route = useRoute();
const router = useRouter();
const company = ref<CompanyWithRelations | null>(null);
const loading = ref(false);
const errorMsg = ref<string | null>(null);
const showDelete = ref(false);

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

onMounted(load);
</script>

<template>
  <AppShell>
    <div class="space-y-4 p-6" v-if="errorMsg && !company">
      <AlertMessage variant="error" :message="errorMsg" />
      <RouterLink to="/companies" class="text-sm text-blue-600 hover:underline">← Tornar al llistat</RouterLink>
    </div>
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
          <button type="button" @click="showDelete = true" class="rounded border border-red-300 bg-white px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200">Eliminar</button>
        </div>
      </form>

      <section class="rounded border border-gray-200 p-4">
        <h2 class="mb-3 text-lg font-medium">Persones ({{ company.people?.length ?? 0 }})</h2>
        <p v-if="!company.people?.length" class="text-sm text-gray-500">Aquesta empresa encara no té persones associades.</p>
        <div v-else class="space-y-2">
          <RouterLink
            v-for="p in company.people"
            :key="p.id"
            :to="`/people/${p.id}`"
            class="flex items-center justify-between rounded border border-gray-200 p-3 hover:bg-gray-50"
          >
            <div>
              <p class="text-sm font-medium">{{ p.full_name }}</p>
              <p v-if="p.email" class="text-xs text-gray-500">{{ p.email }}</p>
            </div>
            <ClientBadge v-if="p.is_client" :since="p.became_client_at" />
          </RouterLink>
        </div>
      </section>

      <section class="rounded border border-gray-200 p-4">
        <h2 class="mb-3 text-lg font-medium">Leads ({{ company.leads?.length ?? 0 }})</h2>
        <p v-if="!company.leads?.length" class="text-sm text-gray-500">Aquesta empresa encara no té cap lead.</p>
        <div v-else class="space-y-2">
          <RouterLink
            v-for="lead in company.leads"
            :key="lead.id"
            :to="`/leads/${lead.id}`"
            class="flex items-center justify-between rounded border border-gray-200 p-3 hover:bg-gray-50"
          >
            <div>
              <p class="text-sm font-medium">{{ lead.message?.slice(0, 80) ?? '(sense missatge)' }}<span v-if="lead.message && lead.message.length > 80">…</span></p>
              <p class="text-xs text-gray-500">{{ new Date(lead.created_at).toLocaleDateString('ca-ES') }}</p>
            </div>
            <LeadStatusBadge :status="lead.status" />
          </RouterLink>
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

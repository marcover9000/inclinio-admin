<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getCompany, updateCompany, deleteCompany } from '../api/companies';
import type { Company } from '../types';
import AppShell from '@/shared/components/AppShell.vue';
import TextField from '@/shared/components/form/TextField.vue';
import TextareaField from '@/shared/components/form/TextareaField.vue';
import SubmitButton from '@/shared/components/form/SubmitButton.vue';
import ConfirmDialog from '@/shared/components/ui/ConfirmDialog.vue';
import AlertMessage from '@/shared/components/ui/AlertMessage.vue';
import ClientBadge from '../components/ClientBadge.vue';

const route = useRoute();
const router = useRouter();
const company = ref<Company | null>(null);
const loading = ref(false);
const errorMsg = ref<string | null>(null);
const showDelete = ref(false);

async function load() {
  company.value = await getCompany(Number(route.params.id));
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
    });
  } catch (e: any) {
    errorMsg.value = e?.response?.data?.message ?? 'No s\'han pogut desar els canvis.';
    console.error(e);
  } finally {
    loading.value = false;
  }
}

async function destroy() {
  if (!company.value) return;
  await deleteCompany(company.value.id);
  router.push('/companies');
}

onMounted(load);
</script>

<template>
  <AppShell>
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
        <div class="col-span-2 flex justify-between">
          <SubmitButton :loading="loading">Desar canvis</SubmitButton>
          <button type="button" @click="showDelete = true" class="text-sm text-red-600 hover:underline">Eliminar</button>
        </div>
      </form>
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

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { createPerson } from '../api/people';
import { listCompanies, getCompany } from '../api/companies';
import type { Company } from '../types';
import AppShell from '@/shared/components/AppShell.vue';
import TextField from '@/shared/components/form/TextField.vue';
import SubmitButton from '@/shared/components/form/SubmitButton.vue';
import AlertMessage from '@/shared/components/ui/AlertMessage.vue';

const route = useRoute();
const router = useRouter();

const form = ref({
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  position: '',
  company_id: null as number | null,
  companyName: '',
});

const companySuggestions = ref<Company[]>([]);
const error = ref<string | null>(null);
const loading = ref(false);

async function searchCompanies() {
  if (!form.value.companyName) {
    companySuggestions.value = [];
    form.value.company_id = null;
    return;
  }
  const result = await listCompanies({ search: form.value.companyName });
  companySuggestions.value = result.data.slice(0, 5);
}

function pickCompany(c: Company) {
  form.value.company_id = c.id;
  form.value.companyName = c.name;
  companySuggestions.value = [];
}

function clearCompany() {
  form.value.company_id = null;
  form.value.companyName = '';
  companySuggestions.value = [];
}

onMounted(async () => {
  const companyId = Number(route.query.companyId);
  if (companyId && !isNaN(companyId)) {
    try {
      const c = await getCompany(companyId);
      form.value.company_id = c.id;
      form.value.companyName = c.name;
    } catch {
      // company not found — silently fall through to manual entry
    }
  }
});

async function submit() {
  loading.value = true;
  error.value = null;
  try {
    const person = await createPerson({
      first_name: form.value.first_name,
      last_name: form.value.last_name || undefined,
      email: form.value.email || undefined,
      phone: form.value.phone || undefined,
      position: form.value.position || undefined,
      company_id: form.value.company_id ?? undefined,
    });
    router.push(`/people/${person.id}`);
  } catch (e: any) {
    error.value = e?.response?.data?.message ?? 'No s\'ha pogut crear la persona.';
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <AppShell>
    <div class="space-y-6 p-6">
      <h1 class="text-2xl font-semibold">Nova persona</h1>
      <AlertMessage v-if="error" variant="error" :message="error" />
      <form @submit.prevent="submit" class="space-y-6">
        <fieldset class="rounded border border-gray-200 p-4">
          <legend class="px-2 text-sm font-medium">Dades de la persona</legend>
          <div class="grid grid-cols-2 gap-4">
            <TextField v-model="form.first_name" label="Nom *" />
            <TextField v-model="form.last_name" label="Cognoms" />
            <TextField v-model="form.email" label="Email" />
            <TextField v-model="form.phone" label="Telèfon" />
            <TextField v-model="form.position" label="Càrrec" />
          </div>
        </fieldset>

        <fieldset class="rounded border border-gray-200 p-4">
          <legend class="px-2 text-sm font-medium">Empresa (opcional)</legend>
          <div class="relative">
            <TextField
              v-model="form.companyName"
              label="Nom de l'empresa"
              @input="searchCompanies"
              :disabled="form.company_id !== null"
            />
            <ul v-if="companySuggestions.length" class="absolute z-10 mt-1 w-full rounded border bg-white shadow">
              <li v-for="c in companySuggestions" :key="c.id" @click="pickCompany(c)" class="cursor-pointer p-2 text-sm hover:bg-gray-100">
                {{ c.name }}<span v-if="c.is_client" class="ml-2 text-xs text-green-600">(client)</span>
              </li>
            </ul>
            <p v-if="form.company_id" class="mt-2 text-xs text-gray-600">
              Empresa seleccionada.
              <button type="button" @click="clearCompany" class="text-blue-600 hover:underline">Esborrar</button>
            </p>
          </div>
        </fieldset>

        <SubmitButton :loading="loading" :block="true">Crear persona</SubmitButton>
      </form>
    </div>
  </AppShell>
</template>

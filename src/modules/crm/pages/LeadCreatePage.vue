<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { createLead } from '../api/leads';
import { listCompanies } from '@/modules/contacts/api/companies';
import type { Company } from '@/modules/contacts/types';
import AppShell from '@/shared/components/AppShell.vue';
import TextField from '@/shared/components/form/TextField.vue';
import TextareaField from '@/shared/components/form/TextareaField.vue';
import SubmitButton from '@/shared/components/form/SubmitButton.vue';
import AlertMessage from '@/shared/components/ui/AlertMessage.vue';

const router = useRouter();

const form = ref({
  person: { first_name: '', last_name: '', email: '', phone: '', position: '' },
  hasCompany: false,
  company: { name: '', vat: '', website: '', address: '' },
  message: '',
  tagsRaw: '',
});

const error = ref<string | null>(null);
const loading = ref(false);
const companySuggestions = ref<Company[]>([]);

async function searchCompanies() {
  if (!form.value.company.name) {
    companySuggestions.value = [];
    return;
  }
  const result = await listCompanies({ search: form.value.company.name });
  companySuggestions.value = result.data.slice(0, 5);
}

async function submit() {
  loading.value = true;
  error.value = null;
  try {
    const lead = await createLead({
      person: {
        first_name: form.value.person.first_name,
        last_name: form.value.person.last_name || undefined,
        email: form.value.person.email || undefined,
        phone: form.value.person.phone || undefined,
        position: form.value.person.position || undefined,
      },
      company: form.value.hasCompany ? {
        name: form.value.company.name,
        vat: form.value.company.vat || undefined,
        website: form.value.company.website || undefined,
        address: form.value.company.address || undefined,
      } : undefined,
      lead: {
        message: form.value.message,
        tags: form.value.tagsRaw.split(',').map(t => t.trim()).filter(Boolean),
      },
    });
    router.push(`/leads/${lead.id}`);
  } catch (e: any) {
    error.value = e?.response?.data?.message ?? 'Error desconegut.';
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <AppShell>
    <div class="space-y-6 p-6">
      <h1 class="text-2xl font-semibold">Nou Lead</h1>
      <AlertMessage v-if="error" variant="error" :message="error" />
      <form @submit.prevent="submit" class="space-y-6">
        <fieldset class="rounded border border-gray-200 p-4">
          <legend class="px-2 text-sm font-medium">Persona</legend>
          <div class="grid grid-cols-2 gap-4">
            <TextField v-model="form.person.first_name" label="Nom *" />
            <TextField v-model="form.person.last_name" label="Cognoms" />
            <TextField v-model="form.person.email" label="Email" />
            <TextField v-model="form.person.phone" label="Telèfon" />
            <TextField v-model="form.person.position" label="Càrrec" />
          </div>
        </fieldset>

        <fieldset class="rounded border border-gray-200 p-4">
          <legend class="px-2 text-sm font-medium">Empresa</legend>
          <label class="flex items-center gap-2 text-sm">
            <input type="checkbox" v-model="form.hasCompany" /> Aquest lead està lligat a una empresa
          </label>
          <div v-if="form.hasCompany" class="mt-4 grid grid-cols-2 gap-4">
            <div class="col-span-2 relative">
              <TextField v-model="form.company.name" label="Nom de l'empresa *" @input="searchCompanies" />
              <ul v-if="companySuggestions.length" class="absolute z-10 mt-1 w-full rounded border bg-white shadow">
                <li v-for="c in companySuggestions" :key="c.id" @click="form.company.name = c.name; companySuggestions = []" class="cursor-pointer p-2 text-sm hover:bg-gray-100">
                  {{ c.name }}<span v-if="c.is_client" class="ml-2 text-xs text-green-600">(client)</span>
                </li>
              </ul>
            </div>
            <TextField v-model="form.company.vat" label="VAT/CIF" />
            <TextField v-model="form.company.website" label="Web" />
            <TextField v-model="form.company.address" label="Adreça" />
          </div>
        </fieldset>

        <fieldset class="rounded border border-gray-200 p-4">
          <legend class="px-2 text-sm font-medium">Lead</legend>
          <TextareaField v-model="form.message" label="Missatge *" :rows="6" />
          <TextField v-model="form.tagsRaw" label="Tags (separats per coma)" placeholder="web, seo, branding" class="mt-4" />
        </fieldset>

        <SubmitButton :loading="loading" :block="true">Crear Lead</SubmitButton>
      </form>
    </div>
  </AppShell>
</template>

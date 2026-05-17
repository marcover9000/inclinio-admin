<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { createLead } from '../api/leads';
import { listPeople, getPerson } from '@/modules/contacts/api/people';
import type { Company, Person } from '@/modules/contacts/types';
import { extractErrorMessage } from '@/shared/http/errors';
import AppShell from '@/shared/components/AppShell.vue';
import TextField from '@/shared/components/form/TextField.vue';
import TextareaField from '@/shared/components/form/TextareaField.vue';
import Button from '@/shared/components/ui/Button.vue';
import Card from '@/shared/components/ui/Card.vue';
import PageHeader from '@/shared/components/ui/PageHeader.vue';
import AlertMessage from '@/shared/components/ui/AlertMessage.vue';
import CompanyPicker from '@/modules/contacts/components/CompanyPicker.vue';

const route = useRoute();
const router = useRouter();

const form = ref({
  person: {
    useExisting: false,
    id: null as number | null,
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    position: '',
  },
  hasCompany: false,
  company: { name: '', vat: '', website: '', address: '' },
  message: '',
  tagsRaw: '',
});

const error = ref<string | null>(null);
const loading = ref(false);
const personSuggestions = ref<Person[]>([]);
const pickedPersonCompany = ref<Company | null>(null);
// El picker exposa company_id però aquest formulari només fa servir el nom.
const pickedCompanyId = ref<number | null>(null);

async function searchPeople() {
  if (form.value.person.useExisting) return;
  const term = form.value.person.first_name || form.value.person.email;
  if (!term || term.length < 2) {
    personSuggestions.value = [];
    return;
  }
  const result = await listPeople({ search: term });
  personSuggestions.value = result.data.slice(0, 5);
}

function pickPerson(p: Person) {
  form.value.person.useExisting = true;
  form.value.person.id = p.id;
  form.value.person.first_name = p.first_name;
  form.value.person.last_name = p.last_name ?? '';
  form.value.person.email = p.email ?? '';
  form.value.person.phone = p.phone ?? '';
  form.value.person.position = p.position ?? '';
  pickedPersonCompany.value = p.company;
  personSuggestions.value = [];
}

function clearPersonSelection() {
  form.value.person.useExisting = false;
  form.value.person.id = null;
  form.value.person.first_name = '';
  form.value.person.last_name = '';
  form.value.person.email = '';
  form.value.person.phone = '';
  form.value.person.position = '';
  pickedPersonCompany.value = null;
  personSuggestions.value = [];
}

async function submit() {
  loading.value = true;
  error.value = null;
  try {
    const usingExisting = form.value.person.useExisting && form.value.person.id != null;
    const lead = await createLead({
      ...(usingExisting
        ? { person_id: form.value.person.id! }
        : {
            person: {
              first_name: form.value.person.first_name,
              last_name: form.value.person.last_name || undefined,
              email: form.value.person.email || undefined,
              phone: form.value.person.phone || undefined,
              position: form.value.person.position || undefined,
            },
          }),
      company: !usingExisting && form.value.hasCompany ? {
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
  } catch (e) {
    error.value = extractErrorMessage(e, 'Error desconegut.');
  } finally {
    loading.value = false;
  }
}

onMounted(async () => {
  const rawId = route.query.personId;
  const personId = rawId != null ? Number(rawId) : NaN;
  if (Number.isFinite(personId) && personId > 0) {
    try {
      const p = await getPerson(personId);
      pickPerson(p);
    } catch (e) {
      console.error(e);
    }
  }
});
</script>

<template>
  <AppShell>
    <PageHeader title="Nou Lead" />
    <AlertMessage v-if="error" variant="error" :message="error" />
    <form @submit.prevent="submit" class="space-y-6">
      <Card as="fieldset" title="Persona">
        <div v-if="form.person.useExisting" class="mb-3 flex items-center justify-between rounded bg-brand-50 px-3 py-2 text-sm text-brand-800">
          <span>Aquesta persona ja existeix al CRM.</span>
          <button type="button" @click="clearPersonSelection" class="text-xs text-brand-700 underline hover:text-brand-900">Esborrar selecció</button>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="relative">
            <TextField
              v-model="form.person.first_name"
              label="Nom *"
              :disabled="form.person.useExisting"
              @input="searchPeople"
            />
            <ul v-if="personSuggestions.length && !form.person.useExisting" class="absolute z-10 mt-1 w-full rounded border bg-white shadow">
              <li
                v-for="p in personSuggestions"
                :key="p.id"
                @click="pickPerson(p)"
                class="cursor-pointer p-2 text-sm hover:bg-neutral-100"
              >
                <div class="font-medium">{{ p.full_name }}</div>
                <div class="text-xs text-neutral-500">
                  <span v-if="p.email">{{ p.email }}</span>
                  <span v-if="p.company"> · {{ p.company.name }}</span>
                </div>
              </li>
            </ul>
          </div>
          <TextField v-model="form.person.last_name" label="Cognoms" :disabled="form.person.useExisting" />
          <div class="relative">
            <TextField
              v-model="form.person.email"
              label="Email"
              :disabled="form.person.useExisting"
              @input="searchPeople"
            />
          </div>
          <TextField v-model="form.person.phone" label="Telèfon" :disabled="form.person.useExisting" />
          <TextField v-model="form.person.position" label="Càrrec" :disabled="form.person.useExisting" />
        </div>
      </Card>

      <Card v-if="form.person.useExisting && pickedPersonCompany" as="fieldset" title="Empresa">
        <p class="text-sm text-neutral-600">Empresa de la persona: <strong>{{ pickedPersonCompany.name }}</strong></p>
      </Card>

      <Card v-if="!form.person.useExisting" as="fieldset" title="Empresa">
        <label class="flex items-center gap-2 text-sm">
          <input type="checkbox" v-model="form.hasCompany" /> Aquest lead està lligat a una empresa
        </label>
        <div v-if="form.hasCompany" class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="md:col-span-2 relative">
            <CompanyPicker
              v-model="pickedCompanyId"
              v-model:name="form.company.name"
              label="Nom de l'empresa *"
            />
          </div>
          <TextField v-model="form.company.vat" label="VAT/CIF" />
          <TextField v-model="form.company.website" label="Web" />
          <TextField v-model="form.company.address" label="Adreça" />
        </div>
      </Card>

      <Card as="fieldset" title="Lead">
        <TextareaField v-model="form.message" label="Missatge *" :rows="6" />
        <TextField v-model="form.tagsRaw" label="Tags (separats per coma)" placeholder="web, seo, branding" class="mt-4" />
      </Card>

      <div class="flex justify-end">
        <Button type="submit" variant="primary" :loading="loading">Crear Lead</Button>
      </div>
    </form>
  </AppShell>
</template>

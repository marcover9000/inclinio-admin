<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { createPerson } from '../api/people';
import { getCompany } from '../api/companies';
import { extractErrorMessage } from '@/shared/http/errors';
import AppShell from '@/shared/components/AppShell.vue';
import TextField from '@/shared/components/form/TextField.vue';
import AlertMessage from '@/shared/components/ui/AlertMessage.vue';
import Button from '@/shared/components/ui/Button.vue';
import Card from '@/shared/components/ui/Card.vue';
import PageHeader from '@/shared/components/ui/PageHeader.vue';
import CompanyPicker from '../components/CompanyPicker.vue';

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

const error = ref<string | null>(null);
const loading = ref(false);

function clearCompany() {
  form.value.company_id = null;
  form.value.companyName = '';
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
  } catch (e) {
    error.value = extractErrorMessage(e, 'No s\'ha pogut crear la persona.');
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <AppShell>
    <PageHeader title="Nova persona" />
    <AlertMessage v-if="error" variant="error" :message="error" />
    <form @submit.prevent="submit" class="space-y-6">
      <Card as="fieldset" title="Dades de la persona">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextField v-model="form.first_name" label="Nom *" />
          <TextField v-model="form.last_name" label="Cognoms" />
          <TextField v-model="form.email" label="Email" />
          <TextField v-model="form.phone" label="Telèfon" />
          <TextField v-model="form.position" label="Càrrec" />
        </div>
      </Card>

      <Card as="fieldset" title="Empresa (opcional)">
        <div class="relative">
          <CompanyPicker
            v-model="form.company_id"
            v-model:name="form.companyName"
            label="Nom de l'empresa"
            :disabled="form.company_id !== null"
          />
          <p v-if="form.company_id" class="mt-2 text-xs text-neutral-600">
            Empresa seleccionada.
            <button type="button" @click="clearCompany" class="text-brand-600 hover:underline">Esborrar</button>
          </p>
        </div>
      </Card>

      <div class="flex justify-end">
        <Button type="submit" variant="primary" :loading="loading">Crear persona</Button>
      </div>
    </form>
  </AppShell>
</template>

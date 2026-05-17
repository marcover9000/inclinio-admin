<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { createCompany } from '../api/companies';
import { extractErrorMessage } from '@/shared/http/errors';
import AppShell from '@/shared/components/AppShell.vue';
import TextField from '@/shared/components/form/TextField.vue';
import TextareaField from '@/shared/components/form/TextareaField.vue';
import AlertMessage from '@/shared/components/ui/AlertMessage.vue';
import Button from '@/shared/components/ui/Button.vue';
import Card from '@/shared/components/ui/Card.vue';
import PageHeader from '@/shared/components/ui/PageHeader.vue';

const router = useRouter();

const form = ref({
  name: '',
  vat: '',
  website: '',
  address: '',
  notes: '',
});

const error = ref<string | null>(null);
const loading = ref(false);

async function submit() {
  loading.value = true;
  error.value = null;
  try {
    const company = await createCompany({
      name: form.value.name,
      vat: form.value.vat || undefined,
      website: form.value.website || undefined,
      address: form.value.address || undefined,
      notes: form.value.notes || undefined,
    });
    router.push(`/companies/${company.id}`);
  } catch (e) {
    error.value = extractErrorMessage(e, 'No s\'ha pogut crear l\'empresa.');
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <AppShell>
    <PageHeader title="Nova empresa" />
    <AlertMessage v-if="error" variant="error" :message="error" />
    <form @submit.prevent="submit" class="space-y-6">
      <Card as="fieldset" title="Dades de l'empresa">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="md:col-span-2">
            <TextField v-model="form.name" label="Nom *" />
          </div>
          <TextField v-model="form.vat" label="VAT/CIF" />
          <TextField v-model="form.website" label="Web" />
          <div class="md:col-span-2">
            <TextField v-model="form.address" label="Adreça" />
          </div>
          <div class="md:col-span-2">
            <TextareaField v-model="form.notes" label="Notes" :rows="4" />
          </div>
        </div>
      </Card>

      <div class="flex justify-end">
        <Button type="submit" variant="primary" :loading="loading">Crear empresa</Button>
      </div>
    </form>
  </AppShell>
</template>

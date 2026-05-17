<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { createProject } from '../api/projects';
import { extractErrorMessage } from '@/shared/http/errors';
import AppShell from '@/shared/components/AppShell.vue';
import TextField from '@/shared/components/form/TextField.vue';
import SubmitButton from '@/shared/components/form/SubmitButton.vue';
import AlertMessage from '@/shared/components/ui/AlertMessage.vue';
import CompanyPicker from '@/modules/contacts/components/CompanyPicker.vue';

const router = useRouter();

const form = ref({
  name: '',
  isInternal: false,
  companyId: null as number | null,
  companyName: '',
  startedAt: '',
  dueAt: '',
  addPack: false,
  packHours: '' as string,
  packPriceEuros: '' as string,
  packReason: 'Venda inicial',
});

const error = ref<string | null>(null);
const loading = ref(false);

const canSubmit = computed(() =>
  form.value.name.trim().length > 0
  && (form.value.isInternal || form.value.companyId !== null),
);

async function submit() {
  error.value = null;
  loading.value = true;
  try {
    const project = await createProject({
      name: form.value.name.trim(),
      is_internal: form.value.isInternal,
      client_company_id: form.value.isInternal ? null : form.value.companyId,
      started_at: form.value.startedAt || null,
      due_at: form.value.dueAt || null,
      pack: form.value.addPack
        ? {
            hours: Number(form.value.packHours),
            price_cents: Math.round(Number(form.value.packPriceEuros) * 100),
            currency: 'EUR',
            reason: form.value.packReason || 'Venda inicial',
          }
        : undefined,
    });
    router.push(`/projects/${project.id}`);
  } catch (e) {
    error.value = extractErrorMessage(e, 'No s\'ha pogut crear el projecte.');
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <AppShell>
    <h1 class="text-2xl font-semibold">Nou Projecte</h1>
    <AlertMessage v-if="error" variant="error" :message="error" />
    <form @submit.prevent="submit" class="space-y-6">
      <fieldset class="rounded border border-neutral-200 p-4 space-y-4">
        <legend class="px-2 text-sm font-medium">Projecte</legend>
        <TextField v-model="form.name" label="Nom *" />
        <label class="flex items-center gap-2 text-sm">
          <input type="checkbox" v-model="form.isInternal" />
          Projecte intern / especulatiu (sense client)
        </label>
        <div v-if="!form.isInternal">
          <CompanyPicker
            v-model="form.companyId"
            v-model:name="form.companyName"
            label="Client (empresa) *"
            placeholder="Cerca una empresa client…"
          />
        </div>
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <TextField v-model="form.startedAt" label="Inici (AAAA-MM-DD)" placeholder="2026-01-15" />
          <TextField v-model="form.dueAt" label="Entrega (AAAA-MM-DD)" placeholder="2026-03-31" />
        </div>
      </fieldset>

      <fieldset class="rounded border border-neutral-200 p-4 space-y-4">
        <legend class="px-2 text-sm font-medium">Bossa d'hores inicial (opcional)</legend>
        <label class="flex items-center gap-2 text-sm">
          <input type="checkbox" v-model="form.addPack" />
          Afegir el pack #1 (venda inicial) ara
        </label>
        <div v-if="form.addPack" class="grid grid-cols-1 gap-4 md:grid-cols-3">
          <TextField v-model="form.packHours" label="Hores" placeholder="40" />
          <TextField v-model="form.packPriceEuros" label="Preu tancat (€)" placeholder="4000" />
          <TextField v-model="form.packReason" label="Concepte" />
        </div>
      </fieldset>

      <SubmitButton :loading="loading" :disabled="!canSubmit" :block="true">Crear Projecte</SubmitButton>
    </form>
  </AppShell>
</template>

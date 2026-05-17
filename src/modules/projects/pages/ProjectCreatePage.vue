<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { createProject } from '../api/projects';
import { extractErrorMessage } from '@/shared/http/errors';
import { emptyPackState, buildPackPayload, packIsValid } from '../pack';
import AppShell from '@/shared/components/AppShell.vue';
import TextField from '@/shared/components/form/TextField.vue';
import DateField from '@/shared/components/form/DateField.vue';
import AlertMessage from '@/shared/components/ui/AlertMessage.vue';
import Button from '@/shared/components/ui/Button.vue';
import Card from '@/shared/components/ui/Card.vue';
import PageHeader from '@/shared/components/ui/PageHeader.vue';
import CompanyPicker from '@/modules/contacts/components/CompanyPicker.vue';
import PackFields from '../components/PackFields.vue';

const router = useRouter();

const form = ref({
  name: '',
  isInternal: false,
  companyId: null as number | null,
  companyName: '',
  startedAt: '',
  dueAt: '',
  addPack: false,
});

const packState = ref(emptyPackState('Venda inicial'));

const error = ref<string | null>(null);
const loading = ref(false);

const dueBeforeStart = computed(() =>
  !!(form.value.startedAt && form.value.dueAt && form.value.dueAt < form.value.startedAt),
);

const canSubmit = computed(() =>
  form.value.name.trim().length > 0
  && (form.value.isInternal || form.value.companyId !== null)
  && !dueBeforeStart.value
  && (!form.value.addPack || packIsValid(packState.value)),
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
      pack: form.value.addPack ? buildPackPayload(packState.value) : undefined,
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
    <PageHeader title="Nou Projecte" />
    <AlertMessage v-if="error" variant="error" :message="error" />
    <form @submit.prevent="submit" class="space-y-6">
      <Card as="fieldset" title="Projecte">
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
          <DateField v-model="form.startedAt" label="Inici" />
          <DateField
            v-model="form.dueAt"
            label="Entrega"
            :min="form.startedAt || undefined"
            :error="dueBeforeStart ? 'L\'entrega no pot ser anterior a l\'inici.' : undefined"
          />
        </div>
      </Card>

      <Card as="fieldset" title="Bossa d'hores inicial (opcional)">
        <label class="flex items-center gap-2 text-sm">
          <input type="checkbox" v-model="form.addPack" />
          Afegir el pack #1 (venda inicial) ara
        </label>
        <PackFields v-if="form.addPack" v-model="packState" />
      </Card>

      <div class="flex justify-end">
        <Button type="submit" variant="primary" :loading="loading" :disabled="!canSubmit">Crear Projecte</Button>
      </div>
    </form>
  </AppShell>
</template>

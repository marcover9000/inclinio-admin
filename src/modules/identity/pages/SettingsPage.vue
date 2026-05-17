<script setup lang="ts">
import { onMounted, ref } from 'vue';
import AppShell from '@/shared/components/AppShell.vue';
import PageHeader from '@/shared/components/ui/PageHeader.vue';
import Card from '@/shared/components/ui/Card.vue';
import Button from '@/shared/components/ui/Button.vue';
import TextField from '@/shared/components/form/TextField.vue';
import AlertMessage from '@/shared/components/ui/AlertMessage.vue';
import { useAsyncAction } from '@/shared/composables/useAsyncAction';
import { getSettings, updateShadowRate } from '../api/settings';

const euros = ref('');
const { run, loading, errorMsg } = useAsyncAction();

async function load() {
  await run(async () => { const s = await getSettings(); euros.value = String(s.shadow_rate.cents / 100); });
}
async function save() {
  await run(async () => { const s = await updateShadowRate(Math.round(Number(euros.value) * 100), 'EUR'); euros.value = String(s.shadow_rate.cents / 100); }, 'No s\'ha pogut desar.');
}
onMounted(load);
</script>

<template>
  <AppShell>
    <PageHeader title="Configuració" subtitle="Tarifa-ombra global (cost/hora)" />
    <AlertMessage v-if="errorMsg" variant="error" :message="errorMsg" />
    <Card title="Tarifa-ombra">
      <form @submit.prevent="save" class="space-y-3">
        <TextField v-model="euros" label="€ / hora" class="w-72" />
        <div class="flex justify-end">
          <Button type="submit" variant="primary" :loading="loading">Desar</Button>
        </div>
      </form>
    </Card>
  </AppShell>
</template>

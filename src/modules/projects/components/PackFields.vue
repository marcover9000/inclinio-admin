<script setup lang="ts">
import { computed } from 'vue';
import type { PackFormState } from '../pack';
import { packTotalCents } from '../pack';
import TextField from '@/shared/components/form/TextField.vue';
import ToggleChip from '@/shared/components/ui/ToggleChip.vue';

/*
 * Camps d'una venda/pack, reutilitzats a crear projecte, ampliació i
 * conversió de lead. Mode "preu tancat" o "per hores" (€/h al pack
 * mateix, pre-omplert 20€). En mode hores el total es mostra en viu.
 * v-model lligat a un PackFormState (el pare el posseeix i el pot resetejar).
 */
const model = defineModel<PackFormState>({ required: true });

const totalFormatted = computed(() => {
  const c = packTotalCents(model.value);
  return c === null
    ? '—'
    : `${(c / 100).toLocaleString('ca-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;
});
</script>

<template>
  <div class="space-y-4">
    <div class="flex gap-2">
      <ToggleChip :active="model.mode === 'fixed'" @toggle="model.mode = 'fixed'">Preu tancat</ToggleChip>
      <ToggleChip :active="model.mode === 'hourly'" @toggle="model.mode = 'hourly'">Per hores</ToggleChip>
    </div>

    <div v-if="model.mode === 'fixed'" class="grid grid-cols-1 gap-4 md:grid-cols-2">
      <TextField v-model="model.priceEuros" label="Preu tancat (€)" />
      <TextField v-model="model.hours" label="Hores estimades (opcional)" />
    </div>
    <div v-else class="grid grid-cols-1 gap-4 md:grid-cols-3">
      <TextField v-model="model.hours" label="Hores" />
      <TextField v-model="model.rateEuros" label="€/hora" />
      <div class="flex flex-col justify-end">
        <span class="text-sm font-medium text-neutral-700">Total</span>
        <span class="py-2 text-sm text-neutral-800">{{ totalFormatted }}</span>
      </div>
    </div>

    <TextField v-model="model.reason" label="Concepte" />
  </div>
</template>

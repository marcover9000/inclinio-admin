<script setup lang="ts">
import type { LeadStatus } from '../types';
import { LEAD_STATUS_LABELS, VALID_TRANSITIONS } from '../types';

defineProps<{ current: LeadStatus }>();
const emit = defineEmits<{ select: [next: LeadStatus] }>();
</script>

<template>
  <select
    @change="emit('select', ($event.target as HTMLSelectElement).value as LeadStatus)"
    class="rounded border-gray-300 text-sm"
    :value="''"
  >
    <option value="" disabled>Canviar a…</option>
    <option v-for="next in VALID_TRANSITIONS[current]" :key="next" :value="next">
      {{ LEAD_STATUS_LABELS[next] }}
    </option>
  </select>
</template>

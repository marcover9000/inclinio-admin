<script setup lang="ts">
import { ref, watch } from 'vue';
import type { LeadStatus } from '../types';
import { LEAD_STATUS_LABELS, VALID_TRANSITIONS } from '../types';

const props = defineProps<{ current: LeadStatus }>();
const emit = defineEmits<{ select: [next: LeadStatus] }>();

const selected = ref<string>('');

function onChange() {
  if (selected.value === '') return;
  emit('select', selected.value as LeadStatus);
  selected.value = '';
}

watch(() => props.current, () => {
  selected.value = '';
});
</script>

<template>
  <select
    v-model="selected"
    @change="onChange"
    class="!rounded-full border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 shadow-sm hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-500"
  >
    <option value="">Canviar a…</option>
    <option v-for="next in VALID_TRANSITIONS[current]" :key="next" :value="next">
      {{ LEAD_STATUS_LABELS[next] }}
    </option>
  </select>
</template>

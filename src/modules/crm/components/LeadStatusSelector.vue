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
    class="rounded border-neutral-300 text-sm"
  >
    <option value="">Canviar a…</option>
    <option v-for="next in VALID_TRANSITIONS[current]" :key="next" :value="next">
      {{ LEAD_STATUS_LABELS[next] }}
    </option>
  </select>
</template>

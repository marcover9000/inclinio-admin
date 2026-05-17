<script setup lang="ts">
import { ref, watch } from 'vue';
import type { ProjectStatus } from '../types';
import { PROJECT_STATUS_LABELS, VALID_PROJECT_TRANSITIONS } from '../types';

const props = defineProps<{ current: ProjectStatus }>();
const emit = defineEmits<{ select: [next: ProjectStatus] }>();

const selected = ref<string>('');

function onChange() {
  if (selected.value === '') return;
  emit('select', selected.value as ProjectStatus);
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
    <option value="">Canviar estat…</option>
    <option v-for="next in VALID_PROJECT_TRANSITIONS[current]" :key="next" :value="next">
      {{ PROJECT_STATUS_LABELS[next] }}
    </option>
  </select>
</template>

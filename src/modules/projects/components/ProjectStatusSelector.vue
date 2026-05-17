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
    class="rounded border-neutral-300 text-sm"
  >
    <option value="">Canviar estat…</option>
    <option v-for="next in VALID_PROJECT_TRANSITIONS[current]" :key="next" :value="next">
      {{ PROJECT_STATUS_LABELS[next] }}
    </option>
  </select>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{ active: boolean }>();
defineEmits<{ toggle: [] }>();

const classes = computed(() => [
  'rounded-full border px-3 py-1 text-xs transition-colors',
  props.active
    ? 'border-brand-300 bg-brand-50 text-brand-800'
    : 'border-neutral-300 text-neutral-500 hover:bg-neutral-50',
]);
</script>

<template>
  <button type="button" :class="classes" @click="$emit('toggle')"><slot /></button>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{ tone?: 'brand' | 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'accent' }>(),
  { tone: 'neutral' },
);

const tones = {
  brand: 'bg-brand-100 text-brand-800',
  neutral: 'bg-neutral-100 text-neutral-600',
  success: 'bg-success-100 text-success-800',
  warning: 'bg-warning-100 text-warning-800',
  danger: 'bg-danger-200 text-danger-800',
  info: 'bg-info-100 text-info-800',
  accent: 'bg-accent-100 text-accent-800',
} as const;

const classes = computed(() => [
  'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium',
  tones[props.tone],
]);
</script>

<template>
  <span :class="classes"><slot /></span>
</template>

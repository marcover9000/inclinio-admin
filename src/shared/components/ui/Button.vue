<script setup lang="ts">
import { computed } from 'vue';
import type { RouteLocationRaw } from 'vue-router';

const props = withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'danger' | 'subtle';
    size?: 'sm' | 'md';
    block?: boolean;
    loading?: boolean;
    disabled?: boolean;
    type?: 'button' | 'submit';
    to?: RouteLocationRaw;
  }>(),
  { variant: 'primary', size: 'md', block: false, loading: false, disabled: false, type: 'button' },
);

defineEmits<{ click: [e: MouseEvent] }>();

const base =
  'inline-flex items-center justify-center gap-2 rounded-md font-medium shadow-sm ' +
  'focus:outline-none focus:ring-2 focus:ring-offset-2 ' +
  'disabled:opacity-50 disabled:cursor-not-allowed';

const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2 text-sm' } as const;

const variants = {
  primary: 'bg-brand-600 text-white hover:bg-brand-700 focus:ring-brand-500',
  secondary: 'border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50 focus:ring-neutral-500',
  danger: 'border border-danger-300 bg-white text-danger-600 hover:bg-danger-50 hover:border-danger-400 focus:ring-danger-200',
  subtle: 'text-neutral-600 shadow-none hover:bg-neutral-100 focus:ring-neutral-500',
} as const;

const isDisabled = computed(() => props.disabled || props.loading);
const classes = computed(() => [
  base,
  sizes[props.size],
  variants[props.variant],
  props.block ? 'w-full' : '',
]);
</script>

<template>
  <RouterLink v-if="to && !isDisabled" :to="to" :class="classes">
    <slot />
  </RouterLink>
  <button v-else :type="type" :disabled="isDisabled" :class="classes" @click="$emit('click', $event)">
    <svg v-if="loading" class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z" />
    </svg>
    <slot />
  </button>
</template>

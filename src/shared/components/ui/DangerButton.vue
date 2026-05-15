<script setup lang="ts">
/*
 * Botó d'acció destructiva (outline). El text ve pel slot.
 */
withDefaults(defineProps<{
  disabled?: boolean;
  loading?: boolean;
}>(), {
  disabled: false,
  loading: false,
});
</script>

<template>
  <button
    type="button"
    :disabled="disabled || loading"
    class="rounded border border-danger-300 bg-white px-4 py-2 text-sm text-danger-600 hover:bg-danger-50 hover:border-danger-400 focus:outline-none focus:ring-2 focus:ring-danger-200 disabled:opacity-50 disabled:cursor-not-allowed"
  >
    <slot />
  </button>
</template>

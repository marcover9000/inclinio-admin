<script setup lang="ts">
/*
 * Botó de submit amb estat de loading.
 * Si loading=true, deshabilita i mostra spinner.
 * Accepta contingut via slot (per defecte) o via prop `label` com a fallback.
 */
defineProps<{
  loading?: boolean;
  disabled?: boolean;
  label?: string;
}>();
</script>

<template>
  <button
    type="submit"
    :disabled="loading || disabled"
    class="w-full flex justify-center items-center rounded-md bg-slate-800 px-4 py-2 text-white font-medium shadow-sm hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
  >
    <span v-if="loading" class="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
    <slot>{{ label }}</slot>
  </button>
</template>

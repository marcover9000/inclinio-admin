<script setup lang="ts">
defineProps<{ since?: string | null }>();
</script>

<template>
  <span class="inline-flex items-center rounded-full bg-success-100 px-2 py-0.5 text-xs font-medium text-success-800">
    Client
    <span v-if="since" class="ml-1 text-success-600">(des de {{ new Date(since).toLocaleDateString('ca-ES') }})</span>
  </span>
</template>

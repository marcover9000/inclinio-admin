<script setup lang="ts">
defineProps<{ since?: string | null }>();
</script>

<template>
  <span class="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
    Client
    <span v-if="since" class="ml-1 text-green-600">(des de {{ new Date(since).toLocaleDateString('ca-ES') }})</span>
  </span>
</template>

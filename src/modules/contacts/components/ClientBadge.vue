<script setup lang="ts">
import { formatDate } from '@/shared/utils/date';

defineProps<{ since?: string | null }>();
</script>

<template>
  <span class="inline-flex items-center rounded-full bg-success-100 px-2 py-0.5 text-xs font-medium text-success-800">
    Client
    <span v-if="since" class="ml-1 text-success-600">(des de {{ formatDate(since) }})</span>
  </span>
</template>

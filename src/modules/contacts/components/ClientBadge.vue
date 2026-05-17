<script setup lang="ts">
import { formatDate } from '@/shared/utils/date';
import Badge from '@/shared/components/ui/Badge.vue';

defineProps<{ since?: string | null }>();
</script>

<template>
  <Badge tone="success">Client<span v-if="since"> (des de {{ formatDate(since) }})</span></Badge>
</template>

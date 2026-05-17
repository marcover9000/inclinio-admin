<script setup lang="ts">
import type { ProjectStatus } from '../types';
import { PROJECT_STATUS_LABELS } from '../types';
import Badge from '@/shared/components/ui/Badge.vue';

defineProps<{ status: ProjectStatus }>();

const tones: Record<ProjectStatus, 'success' | 'warning' | 'brand' | 'neutral'> = {
  active: 'success',
  paused: 'warning',
  done: 'brand',
  archived: 'neutral',
};
</script>

<template>
  <Badge :tone="tones[status]">{{ PROJECT_STATUS_LABELS[status] }}</Badge>
</template>

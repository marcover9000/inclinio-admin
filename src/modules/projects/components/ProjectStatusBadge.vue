<script setup lang="ts">
import type { ProjectStatus } from '../types';
import { PROJECT_STATUS_LABELS } from '../types';

defineProps<{ status: ProjectStatus }>();

const colors: Record<ProjectStatus, string> = {
  active: 'bg-success-100 text-success-800',
  paused: 'bg-warning-100 text-warning-800',
  done: 'bg-brand-100 text-brand-800',
  archived: 'bg-neutral-100 text-neutral-600',
};
</script>

<template>
  <span :class="['inline-flex rounded-full px-2 py-0.5 text-xs font-medium', colors[status]]">
    {{ PROJECT_STATUS_LABELS[status] }}
  </span>
</template>

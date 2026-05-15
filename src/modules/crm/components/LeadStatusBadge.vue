<script setup lang="ts">
import type { LeadStatus } from '../types';
import { LEAD_STATUS_LABELS } from '../types';

defineProps<{ status: LeadStatus }>();

const colors: Record<LeadStatus, string> = {
  new: 'bg-brand-100 text-brand-800',
  contacted: 'bg-warning-100 text-warning-800',
  qualified: 'bg-info-100 text-info-800',
  proposal: 'bg-accent-100 text-accent-800',
  won: 'bg-success-100 text-success-800',
  lost: 'bg-neutral-100 text-neutral-600',
};
</script>

<template>
  <span :class="['inline-flex rounded-full px-2 py-0.5 text-xs font-medium', colors[status]]">
    {{ LEAD_STATUS_LABELS[status] }}
  </span>
</template>

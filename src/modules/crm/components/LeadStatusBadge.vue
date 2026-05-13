<script setup lang="ts">
import type { LeadStatus } from '../types';
import { LEAD_STATUS_LABELS } from '../types';

defineProps<{ status: LeadStatus }>();

const colors: Record<LeadStatus, string> = {
  new: 'bg-blue-100 text-blue-800',
  contacted: 'bg-yellow-100 text-yellow-800',
  qualified: 'bg-purple-100 text-purple-800',
  proposal: 'bg-orange-100 text-orange-800',
  won: 'bg-green-100 text-green-800',
  lost: 'bg-gray-100 text-gray-600',
};
</script>

<template>
  <span :class="['inline-flex rounded-full px-2 py-0.5 text-xs font-medium', colors[status]]">
    {{ LEAD_STATUS_LABELS[status] }}
  </span>
</template>

<script setup lang="ts">
import type { LeadStatus } from '../types';
import { LEAD_STATUS_LABELS } from '../types';
import Badge from '@/shared/components/ui/Badge.vue';

defineProps<{ status: LeadStatus }>();

const tones: Record<LeadStatus, 'brand' | 'warning' | 'info' | 'accent' | 'success' | 'neutral'> = {
  new: 'brand',
  contacted: 'warning',
  qualified: 'info',
  proposal: 'accent',
  won: 'success',
  lost: 'neutral',
};
</script>

<template>
  <Badge :tone="tones[status]">{{ LEAD_STATUS_LABELS[status] }}</Badge>
</template>

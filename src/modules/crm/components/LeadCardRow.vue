<script setup lang="ts">
import { RouterLink } from 'vue-router';
import type { Lead } from '../types';
import { formatDate } from '@/shared/utils/date';
import LeadStatusBadge from './LeadStatusBadge.vue';

/*
 * Fila clicable d'un lead dins d'un llistat relacionat (persona, empresa).
 */
defineProps<{ lead: Lead }>();
</script>

<template>
  <RouterLink
    :to="`/leads/${lead.id}`"
    class="flex items-center justify-between rounded border border-neutral-200 p-3 hover:bg-neutral-50"
  >
    <div>
      <p class="text-sm font-medium">
        {{ lead.message?.slice(0, 80) ?? '(sense missatge)' }}<span v-if="lead.message && lead.message.length > 80">…</span>
      </p>
      <p class="text-xs text-neutral-500">
        {{ formatDate(lead.created_at) }} · Origen: {{ lead.source }}
      </p>
    </div>
    <LeadStatusBadge :status="lead.status" />
  </RouterLink>
</template>

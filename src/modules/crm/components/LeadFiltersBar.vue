<script setup lang="ts">
import { LEAD_STATUS_LABELS, LEAD_STATUSES, type LeadStatus } from '../types';
import TextField from '@/shared/components/form/TextField.vue';

defineProps<{
  search: string;
  selectedStatuses: LeadStatus[];
  selectedTags: string[];
  availableTags: string[];
}>();

defineEmits<{
  'update:search': [v: string];
  'update:selectedStatuses': [v: LeadStatus[]];
  'update:selectedTags': [v: string[]];
}>();

const allStatuses = LEAD_STATUSES;
</script>

<template>
  <div class="flex flex-wrap items-center gap-4">
    <TextField :model-value="search" @update:model-value="$emit('update:search', $event)" label="Cerca" placeholder="Nom o email…" />
    <div>
      <p class="text-sm font-medium text-neutral-700">Estats</p>
      <div class="flex gap-1 flex-wrap">
        <label v-for="s in allStatuses" :key="s" class="flex items-center gap-1 text-xs">
          <input
            type="checkbox"
            :checked="selectedStatuses.includes(s)"
            @change="$emit('update:selectedStatuses', selectedStatuses.includes(s) ? selectedStatuses.filter(x => x !== s) : [...selectedStatuses, s])"
          />
          {{ LEAD_STATUS_LABELS[s] }}
        </label>
      </div>
    </div>
  </div>
</template>

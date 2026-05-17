<script setup lang="ts">
import { LEAD_STATUS_LABELS, LEAD_STATUSES, type LeadStatus } from '../types';
import TextField from '@/shared/components/form/TextField.vue';
import FilterBar from '@/shared/components/ui/FilterBar.vue';
import ToggleChip from '@/shared/components/ui/ToggleChip.vue';

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
</script>

<template>
  <FilterBar>
    <TextField
      :model-value="search"
      @update:model-value="$emit('update:search', $event)"
      label="Cerca"
      class="w-72"
      placeholder="Nom o email…"
    />
    <ToggleChip
      v-for="s in LEAD_STATUSES"
      :key="s"
      :active="selectedStatuses.includes(s)"
      @toggle="$emit('update:selectedStatuses', selectedStatuses.includes(s) ? selectedStatuses.filter(x => x !== s) : [...selectedStatuses, s])"
    >{{ LEAD_STATUS_LABELS[s] }}</ToggleChip>
  </FilterBar>
</template>

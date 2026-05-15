<script setup lang="ts">
import { RouterLink } from 'vue-router';
import type { Person } from '../types';
import ClientBadge from './ClientBadge.vue';

defineProps<{ person: Person }>();
</script>

<template>
  <RouterLink :to="`/people/${person.id}`" class="block rounded border border-gray-200 p-3 hover:bg-gray-50">
    <div class="flex items-center justify-between">
      <span class="font-medium">{{ person.full_name }}</span>
      <ClientBadge v-if="person.is_client" :since="person.became_client_at" />
    </div>
    <p v-if="person.company" class="text-xs text-gray-500">{{ person.company.name }}</p>
  </RouterLink>
</template>

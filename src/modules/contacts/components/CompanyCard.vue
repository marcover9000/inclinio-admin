<script setup lang="ts">
import { RouterLink } from 'vue-router';
import type { Company } from '../types';
import ClientBadge from './ClientBadge.vue';

defineProps<{ company: Company }>();
</script>

<template>
  <RouterLink :to="`/companies/${company.id}`" class="block rounded border border-gray-200 p-3 hover:bg-gray-50">
    <div class="flex items-center justify-between">
      <span class="font-medium">{{ company.name }}</span>
      <ClientBadge v-if="company.is_client" :since="company.became_client_at" />
    </div>
    <p v-if="company.vat" class="text-xs text-gray-500">VAT: {{ company.vat }}</p>
  </RouterLink>
</template>

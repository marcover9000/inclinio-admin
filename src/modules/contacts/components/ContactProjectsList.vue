<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
import { listProjects } from '@/modules/projects/api/projects';
import type { Project } from '@/modules/projects/types';
import { extractErrorMessage } from '@/shared/http/errors';
import AlertMessage from '@/shared/components/ui/AlertMessage.vue';
import ProjectStatusBadge from '@/modules/projects/components/ProjectStatusBadge.vue';

/*
 * Llista de projectes associats a un contacte (empresa o persona).
 * Reutilitzada a CompanyDetailPage i PersonDetailPage.
 */
const props = defineProps<{
  companyId?: number;
  personId?: number;
}>();

const projects = ref<Project[]>([]);
const loading = ref(false);
const errorMsg = ref<string | null>(null);

async function load() {
  loading.value = true;
  errorMsg.value = null;
  try {
    const result = await listProjects({
      client_company_id: props.companyId,
      client_person_id: props.personId,
    });
    projects.value = result.data;
  } catch (e) {
    errorMsg.value = extractErrorMessage(e, 'No s\'han pogut carregar els projectes.');
    console.error(e);
  } finally {
    loading.value = false;
  }
}

onMounted(load);
</script>

<template>
  <section class="rounded border border-neutral-200 p-4">
    <h2 class="mb-3 text-lg font-medium">Projectes ({{ projects.length }})</h2>
    <AlertMessage v-if="errorMsg" variant="error" :message="errorMsg" />
    <p v-else-if="loading" class="text-sm text-neutral-500">Carregant…</p>
    <p v-else-if="!projects.length" class="text-sm text-neutral-500">Encara no hi ha cap projecte associat.</p>
    <div v-else class="space-y-2">
      <div
        v-for="p in projects"
        :key="p.id"
        class="flex items-center justify-between rounded border border-neutral-200 p-3 hover:bg-neutral-50"
      >
        <RouterLink :to="`/projects/${p.id}`" class="flex-1">
          <p class="text-sm font-medium text-brand-600 hover:underline">{{ p.name }}</p>
          <p class="text-xs text-neutral-500">{{ p.total_price.formatted }} · {{ p.budgeted_hours }} h</p>
        </RouterLink>
        <ProjectStatusBadge :status="p.status" />
      </div>
    </div>
  </section>
</template>

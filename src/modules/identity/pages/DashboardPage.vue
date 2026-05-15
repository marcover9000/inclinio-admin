<script setup lang="ts">
/*
 * Dashboard inicial post-login. A Fase 1 només mostra "Hola, {nom}" i el rol.
 * A Fase 2+ s'omplirà amb cards de leads, factures, etc.
 */
import { useAuthStore } from '@/shared/stores/auth';
import AppShell from '@/shared/components/AppShell.vue';

const auth = useAuthStore();
</script>

<template>
  <AppShell>
    <div class="space-y-4">
      <h1 class="text-2xl font-semibold text-neutral-800">Hola, {{ auth.user?.name }}</h1>
      <p class="text-neutral-600">Rol: <span class="font-mono">{{ auth.user?.role }}</span></p>
      <p class="text-sm text-neutral-500">
        Dashboard buit. Les funcionalitats arribaran a Fase 2 (CRM) i posteriors.
      </p>
    </div>
  </AppShell>
</template>

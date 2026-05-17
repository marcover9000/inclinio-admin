<script setup lang="ts">
/*
 * Dashboard inicial post-login. A Fase 1 només mostra "Hola, {nom}" i el rol.
 * A Fase 2+ s'omplirà amb cards de leads, factures, etc.
 */
import { useAuthStore } from '@/shared/stores/auth';
import AppShell from '@/shared/components/AppShell.vue';
import PageHeader from '@/shared/components/ui/PageHeader.vue';
import Card from '@/shared/components/ui/Card.vue';

const auth = useAuthStore();
const userName = auth.user?.name ?? '';
</script>

<template>
  <AppShell>
    <PageHeader :title="'Hola, ' + userName" />

    <Card>
      <p class="text-neutral-600">Rol: <span class="font-mono">{{ auth.user?.role }}</span></p>
      <p class="text-sm text-neutral-500">
        Dashboard buit. Les funcionalitats arribaran a Fase 2 (CRM) i posteriors.
      </p>
    </Card>
  </AppShell>
</template>

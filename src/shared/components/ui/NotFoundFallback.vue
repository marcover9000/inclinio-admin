<script setup lang="ts">
import { RouterLink } from 'vue-router';
import AlertMessage from './AlertMessage.vue';

/*
 * Estat "el registre no existeix": alerta + enllaç per tornar al llistat.
 */
withDefaults(defineProps<{
  message?: string;
  backTo: string;
  backLabel: string;
}>(), {
  message: 'Aquest registre no existeix o ha estat eliminat.',
});
</script>

<template>
  <!-- El padding ve d'AppShell; aquí només l'espaiat intern. -->
  <div class="space-y-4">
    <AlertMessage variant="error" :message="message" />
    <RouterLink :to="backTo" class="text-sm text-brand-600 hover:underline">← {{ backLabel }}</RouterLink>
  </div>
</template>

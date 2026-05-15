<script setup lang="ts">
import { RouterLink } from 'vue-router';
import { useViewport } from '@/shared/composables/useViewport';
import AlertMessage from './AlertMessage.vue';

/*
 * Embolcalla vistes no aptes per a mòbil/tauleta (futures pantalles
 * tècniques o de configuració). Si NO és desktop mostra un fallback
 * net amb enllaç de tornada; si és desktop renderitza el <slot/>.
 *
 * Ús:
 *   <DesktopOnly back-to="/leads">
 *     <ConfigPanell />
 *   </DesktopOnly>
 *
 * Les pàgines actuals (llistats, detalls, formularis) són aptes per a
 * consulta mòbil i NO han d'usar aquest component.
 */
withDefaults(defineProps<{
  backTo?: string;
}>(), {
  backTo: '/leads',
});

const { isDesktop } = useViewport();
</script>

<template>
  <slot v-if="isDesktop" />
  <!-- El padding ve d'AppShell; aquí només l'espaiat intern. -->
  <div v-else class="space-y-4">
    <AlertMessage
      variant="info"
      message="Aquesta vista requereix una pantalla més gran. Accedeix-hi des d'un ordinador."
    />
    <RouterLink :to="backTo" class="text-sm text-brand-600 hover:underline">← Tornar</RouterLink>
  </div>
</template>

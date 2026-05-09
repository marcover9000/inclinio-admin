<script setup lang="ts">
// Pantalla inicial de smoke test. Comprova que Vue està viu i
// que pot parlar amb l'API.
import { ref, onMounted } from 'vue';
import { http } from './shared/http/client';

const apiStatus = ref<string>('comprovant…');
const apiError = ref<string | null>(null);

onMounted(async () => {
  try {
    const { data } = await http.get('/api/health');
    apiStatus.value = data.status;
  } catch (err) {
    apiError.value = err instanceof Error ? err.message : 'desconegut';
  }
});
</script>

<template>
  <main class="min-h-screen flex items-center justify-center bg-slate-50">
    <div class="text-center space-y-3">
      <h1 class="text-3xl font-semibold text-slate-800">Inclinio v2</h1>
      <p class="text-slate-600">Panell d'administració</p>
      <p class="text-sm">
        Estat de l'API:
        <span v-if="apiError" class="text-red-600">error — {{ apiError }}</span>
        <span v-else class="text-green-600 font-mono">{{ apiStatus }}</span>
      </p>
    </div>
  </main>
</template>

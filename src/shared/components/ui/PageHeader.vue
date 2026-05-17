<script setup lang="ts">
defineProps<{ title: string; subtitle?: string }>();
</script>

<template>
  <header class="flex items-start justify-between gap-4">
    <div>
      <h1 class="text-2xl font-semibold">{{ title }}</h1>
      <p v-if="subtitle" class="text-sm text-neutral-500">{{ subtitle }}</p>
    </div>
    <div class="flex items-center gap-3">
      <slot name="badge" />
      <slot name="actions" />
    </div>
  </header>
</template>

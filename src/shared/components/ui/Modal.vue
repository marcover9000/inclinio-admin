<script setup lang="ts">
defineProps<{ open: boolean; title?: string }>();
defineEmits<{ close: [] }>();
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <div class="absolute inset-0 bg-black/30" @click="$emit('close')"></div>
      <div class="relative w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <h3 v-if="title" class="mb-2 text-lg font-semibold">{{ title }}</h3>
        <slot />
      </div>
    </div>
  </Teleport>
</template>

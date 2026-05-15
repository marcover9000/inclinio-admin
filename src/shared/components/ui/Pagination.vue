<script setup lang="ts">
defineProps<{
  currentPage: number;
  lastPage: number;
  total: number;
}>();

defineEmits<{
  change: [page: number];
}>();
</script>

<template>
  <div class="flex items-center justify-between border-t border-neutral-200 px-4 py-3">
    <p class="text-sm text-neutral-700">
      Total: <span class="font-medium">{{ total }}</span>
    </p>
    <div class="flex gap-2">
      <button
        :disabled="currentPage <= 1"
        @click="$emit('change', currentPage - 1)"
        class="rounded border px-3 py-1 text-sm disabled:opacity-50"
      >
        Anterior
      </button>
      <span class="px-3 py-1 text-sm">Pàg. {{ currentPage }} / {{ lastPage }}</span>
      <button
        :disabled="currentPage >= lastPage"
        @click="$emit('change', currentPage + 1)"
        class="rounded border px-3 py-1 text-sm disabled:opacity-50"
      >
        Següent
      </button>
    </div>
  </div>
</template>

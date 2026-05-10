<script setup lang="ts">
/*
 * Banner d'alerta. variant: 'success' | 'error' | 'info'.
 */
defineProps<{
  variant: 'success' | 'error' | 'info';
  message: string;
}>();

const variantClasses: Record<string, string> = {
  success: 'bg-green-50 text-green-800 border-green-200',
  error: 'bg-red-50 text-red-800 border-red-200',
  info: 'bg-blue-50 text-blue-800 border-blue-200',
};
</script>

<template>
  <div class="rounded-md border px-4 py-3 text-sm" :class="variantClasses[variant]">
    {{ message }}
  </div>
</template>

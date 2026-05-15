<script setup lang="ts">
import type { LeadNote } from '../types';
import { formatDateTime } from '@/shared/utils/date';

defineProps<{ notes: LeadNote[] }>();
defineEmits<{ delete: [noteId: number] }>();
</script>

<template>
  <div class="space-y-3">
    <p v-if="notes.length === 0" class="text-sm text-neutral-500">Encara no hi ha notes.</p>
    <div v-for="note in notes" :key="note.id" class="rounded border border-neutral-200 p-3">
      <div class="flex items-center justify-between">
        <p class="text-xs text-neutral-500">{{ note.author.name }} · {{ formatDateTime(note.created_at) }}</p>
        <button @click="$emit('delete', note.id)" class="text-xs text-danger-600 hover:underline">Eliminar</button>
      </div>
      <p class="mt-1 whitespace-pre-wrap text-sm">{{ note.body }}</p>
    </div>
  </div>
</template>

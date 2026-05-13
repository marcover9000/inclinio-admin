<script setup lang="ts" generic="T extends Record<string, any>">
defineProps<{
  rows: T[];
  columns: Array<{ key: keyof T | string; label: string }>;
  loading?: boolean;
}>();
</script>

<template>
  <div class="overflow-x-auto rounded border border-gray-200">
    <table class="min-w-full divide-y divide-gray-200">
      <thead class="bg-gray-50">
        <tr>
          <th
            v-for="col in columns"
            :key="col.key as string"
            class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
          >
            {{ col.label }}
          </th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-200 bg-white">
        <tr v-if="loading">
          <td :colspan="columns.length" class="px-4 py-6 text-center text-gray-500">Carregant…</td>
        </tr>
        <tr v-else-if="rows.length === 0">
          <td :colspan="columns.length" class="px-4 py-6 text-center text-gray-500">Cap registre.</td>
        </tr>
        <tr v-else v-for="(row, idx) in rows" :key="idx" class="hover:bg-gray-50">
          <td v-for="col in columns" :key="col.key as string" class="whitespace-nowrap px-4 py-3 text-sm">
            <slot :name="`cell-${col.key as string}`" :row="row">{{ row[col.key as keyof T] }}</slot>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

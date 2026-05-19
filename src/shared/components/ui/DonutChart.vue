<script setup lang="ts">
import { computed } from 'vue';

/*
 * Donut SVG inline, zero dependències (mateix criteri que AppIcon/useViewport).
 * `colorClass` és una utilitat de color de text de Tailwind (p. ex.
 * 'text-brand-600'); el segment usa stroke=currentColor i el punt de la
 * llegenda bg-current, així el color viu sempre en tokens existents.
 * r = 15.91549431 → circumferència ≈ 100, els percentatges mapegen directe.
 */
interface Segment { label: string; value: number; colorClass: string }

const props = defineProps<{ segments: Segment[] }>();

const R = 15.91549431;

const total = computed(() => props.segments.reduce((acc, s) => acc + s.value, 0));

const arcs = computed(() => {
  let before = 0;
  return props.segments
    .filter((s) => s.value > 0)
    .map((s) => {
      const pct = total.value > 0 ? (s.value / total.value) * 100 : 0;
      const arc = { colorClass: s.colorClass, dash: `${pct} ${100 - pct}`, offset: -before };
      before += pct;
      return arc;
    });
});
</script>

<template>
  <div class="flex flex-col items-center gap-4 sm:flex-row">
    <svg viewBox="0 0 36 36" class="h-40 w-40 shrink-0" role="img" aria-label="Hores per projecte">
      <circle cx="18" cy="18" :r="R" fill="none" class="text-neutral-200" stroke="currentColor" stroke-width="4" />
      <circle
        v-for="(a, i) in arcs"
        :key="i"
        cx="18"
        cy="18"
        :r="R"
        fill="none"
        :class="a.colorClass"
        stroke="currentColor"
        stroke-width="4"
        stroke-linecap="butt"
        :stroke-dasharray="a.dash"
        :stroke-dashoffset="a.offset"
        transform="rotate(-90 18 18)"
      />
      <text x="18" y="17.5" text-anchor="middle" fill="currentColor" class="text-neutral-800" style="font-size:5px;font-weight:600">
        {{ total > 0 ? total.toLocaleString('ca-ES') : '—' }}
      </text>
      <text x="18" y="22" text-anchor="middle" fill="currentColor" class="text-neutral-500" style="font-size:2.6px">h</text>
    </svg>
    <ul class="w-full space-y-1 text-sm">
      <li v-for="(s, i) in segments" :key="i" class="flex items-center justify-between gap-3">
        <span class="flex min-w-0 items-center gap-2">
          <span class="h-2.5 w-2.5 shrink-0 rounded-full bg-current" :class="s.colorClass" />
          <span class="truncate text-neutral-700">{{ s.label }}</span>
        </span>
        <span class="shrink-0 tabular-nums text-neutral-600">{{ s.value.toLocaleString('ca-ES') }} h</span>
      </li>
      <li v-if="!segments.length" class="text-neutral-500">Sense dades</li>
    </ul>
  </div>
</template>

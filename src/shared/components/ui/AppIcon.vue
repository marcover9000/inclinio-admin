<script lang="ts">
export type IconName =
  | 'dashboard'
  | 'leads'
  | 'persones'
  | 'empreses'
  | 'projectes'
  | 'hores'
  | 'config'
  | 'menu'
  | 'close';
</script>

<script setup lang="ts">
/*
 * Icones SVG inline. Sense dependències (bridge sense internet, mateix
 * criteri que useViewport). Stroke + currentColor perquè l'estat actiu
 * en reculli el color. Afegir-ne una: una entrada més a `paths`.
 */
defineProps<{ name: IconName }>();

const paths: Record<IconName, string> = {
  dashboard:
    '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  leads: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/>',
  persones: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>',
  empreses:
    '<rect x="4" y="3" width="16" height="18" rx="1"/><path d="M9 8h2M13 8h2M9 12h2M13 12h2M10 21v-4h4v4"/>',
  projectes: '<path d="M3 7a1 1 0 011-1h5l2 2h9a1 1 0 011 1v10a1 1 0 01-1 1H4a1 1 0 01-1-1z"/>',
  hores: '<circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/>',
  config:
    '<circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2 2M16.4 16.4l2 2M18.4 5.6l-2 2M7.6 16.4l-2 2"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
};
</script>

<template>
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    v-html="paths[name]"
  ></svg>
</template>

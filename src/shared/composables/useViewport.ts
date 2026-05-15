import { onScopeDispose, readonly, ref } from 'vue';

/*
 * Breakpoints reactius via window.matchMedia (sense dependències).
 * Única font de veritat dels llindars, alineats amb Tailwind:
 *   mòbil  <768   |  tauleta 768–1023 (md)  |  desktop ≥1024 (lg)
 */
const MD = 768;
const LG = 1024;

export function useViewport() {
  const isMobile = ref(false);
  const isTablet = ref(false);
  const isDesktop = ref(true);

  // Defensiu: SSR / entorns sense window.
  if (typeof window === 'undefined' || !window.matchMedia) {
    return {
      isMobile: readonly(isMobile),
      isTablet: readonly(isTablet),
      isDesktop: readonly(isDesktop),
    };
  }

  const tabletQuery = window.matchMedia(`(min-width: ${MD}px) and (max-width: ${LG - 1}px)`);
  const desktopQuery = window.matchMedia(`(min-width: ${LG}px)`);

  function update() {
    isDesktop.value = desktopQuery.matches;
    isTablet.value = tabletQuery.matches;
    isMobile.value = !desktopQuery.matches && !tabletQuery.matches;
  }

  update();
  tabletQuery.addEventListener('change', update);
  desktopQuery.addEventListener('change', update);

  onScopeDispose(() => {
    tabletQuery.removeEventListener('change', update);
    desktopQuery.removeEventListener('change', update);
  });

  return {
    isMobile: readonly(isMobile),
    isTablet: readonly(isTablet),
    isDesktop: readonly(isDesktop),
  };
}

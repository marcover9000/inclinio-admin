import { onMounted, ref, watch, type Ref, type WatchSource } from 'vue';
import { extractErrorMessage } from '@/shared/http/errors';
import type { Paginated } from '@/modules/contacts/types';

interface UsePaginatedResourceOptions<T> {
  // Fetcher: rep la pàgina actual i retorna una pàgina de resultats.
  fetcher: (page: number) => Promise<Paginated<T>>;
  // Fonts reactives que, en canviar, recarreguen (filtres, cerca…). La
  // pàgina ja s'observa internament.
  watchSources?: WatchSource[];
  watchDeep?: boolean;
  errorMessage?: string;
}

export function usePaginatedResource<T>(options: UsePaginatedResourceOptions<T>) {
  const { fetcher, watchSources = [], watchDeep = false, errorMessage = 'No s\'han pogut carregar les dades.' } = options;

  const data = ref<Paginated<T> | null>(null) as Ref<Paginated<T> | null>;
  const loading = ref(false);
  const errorMsg = ref<string | null>(null);
  const page = ref(1);

  async function load() {
    loading.value = true;
    errorMsg.value = null;
    try {
      data.value = await fetcher(page.value);
    } catch (e) {
      errorMsg.value = extractErrorMessage(e, errorMessage);
      console.error(e);
    } finally {
      loading.value = false;
    }
  }

  onMounted(load);
  watch([() => page.value, ...watchSources], load, { deep: watchDeep });

  return { data, loading, errorMsg, page, reload: load };
}

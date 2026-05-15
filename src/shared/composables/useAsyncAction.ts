import { ref } from 'vue';
import { extractErrorMessage } from '@/shared/http/errors';

/*
 * Embolcalla una acció async amb flag de loading i captura d'error
 * (missatge via extractErrorMessage). `run` retorna true si l'acció
 * ha acabat sense error, false en cas contrari.
 */
export function useAsyncAction(defaultError = 'Hi ha hagut un error') {
  const loading = ref(false);
  const errorMsg = ref<string | null>(null);

  async function run(fn: () => Promise<void>, errorMessage = defaultError): Promise<boolean> {
    loading.value = true;
    errorMsg.value = null;
    try {
      await fn();
      return true;
    } catch (e) {
      errorMsg.value = extractErrorMessage(e, errorMessage);
      console.error(e);
      return false;
    } finally {
      loading.value = false;
    }
  }

  return { run, loading, errorMsg };
}

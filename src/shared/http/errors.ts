/*
 * Extreu el missatge d'error d'una resposta d'API (Laravel) amb fallback.
 */
export function extractErrorMessage(e: unknown, fallback = 'Hi ha hagut un error'): string {
  const message = (e as { response?: { data?: { message?: unknown } } })?.response?.data?.message;
  return typeof message === 'string' && message ? message : fallback;
}

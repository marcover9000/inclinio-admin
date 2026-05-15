/*
 * Formatadors de data en locale català. `empty` és el text de fallback
 * quan l'ISO és buit/null (per defecte cadena buida).
 */
export function formatDate(iso: string | null | undefined, empty = ''): string {
  if (!iso) return empty;
  return new Date(iso).toLocaleDateString('ca-ES');
}

export function formatDateTime(iso: string | null | undefined, empty = ''): string {
  if (!iso) return empty;
  return new Date(iso).toLocaleString('ca-ES');
}

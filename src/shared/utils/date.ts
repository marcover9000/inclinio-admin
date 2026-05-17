/*
 * Formatadors de data. Format de data visible canònic a tota l'app:
 * dd/mm/aaaa amb zeros (igual que el DateField). `empty` és el text de
 * fallback quan l'ISO és buit/null (per defecte cadena buida).
 */
export function formatDate(iso: string | null | undefined, empty = ''): string {
  if (!iso) return empty;
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (m) return `${m[3]}/${m[2]}/${m[1]}`;
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}

export function formatDateTime(iso: string | null | undefined, empty = ''): string {
  if (!iso) return empty;
  return new Date(iso).toLocaleString('ca-ES');
}

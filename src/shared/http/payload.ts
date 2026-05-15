/*
 * Converteix les cadenes buides d'un payload a null abans d'enviar-lo a l'API
 * (evita desar "" on el backend espera null).
 */
export function nullifyEmptyStrings<T extends Record<string, unknown>>(payload: T): T {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(payload)) {
    out[k] = v === '' ? null : v;
  }
  return out as T;
}

/**
 * @nexora/api: utilidades comunes de los endpoints (respuestas, body, IP, límites por clave).
 * Contrato en ../README.md.
 */

/** Respuesta JSON sin caché (salvo que `headers` diga otra cosa). */
export function json(body: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...headers },
  });
}

/** IP del cliente detrás del proxy de Vercel. "local" si no hay cabeceras (desarrollo). */
export function clientIp(request: Request): string {
  return (request.headers.get("x-forwarded-for") || "").split(",")[0].trim() || request.headers.get("x-real-ip") || "local";
}

/** Lee un body JSON que tiene que ser un objeto. Devuelve null si es inválido o supera `maxBytes`. */
export async function readJSONBody(request: Request, maxBytes = 10_000): Promise<Record<string, unknown> | null> {
  const text = await request.text();
  if (text.length > maxBytes) return null;
  try {
    const b = JSON.parse(text);
    return b && typeof b === "object" && !Array.isArray(b) ? (b as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

export interface RateLimiter {
  /** Registra un evento y dice si la clave superó el máximo en la ventana. */
  hit(key: string): boolean;
  /** ¿La clave ya llegó al máximo? (sin registrar nada) */
  blocked(key: string): boolean;
  /** Registra un evento sin consultar. */
  record(key: string): void;
  /** Eventos de la clave dentro de la ventana. */
  count(key: string): number;
  reset(): void;
}

/**
 * Límite por clave (por ejemplo la IP) en memoria de cada instancia.
 * Alcanza para frenar abusos simples en un sitio chico; no es compartido entre instancias.
 * Ojo en tests: el estado vive mientras viva el proceso.
 */
export function createRateLimiter({ max, windowMs, maxKeys = 5000 }: { max: number; windowMs: number; maxKeys?: number }): RateLimiter {
  const hits = new Map<string, number[]>();
  const recent = (key: string) => {
    const now = Date.now();
    const list = (hits.get(key) || []).filter((t) => now - t < windowMs);
    if (list.length) hits.set(key, list);
    else hits.delete(key);
    return list;
  };
  const record = (key: string) => {
    hits.set(key, [...recent(key), Date.now()]);
    if (hits.size > maxKeys) hits.clear();
  };
  return {
    hit(key) {
      record(key);
      return recent(key).length > max;
    },
    blocked: (key) => recent(key).length >= max,
    record,
    count: (key) => recent(key).length,
    reset: () => hits.clear(),
  };
}

/** Honeypot: el campo oculto `website` viene con texto solo si lo completó un bot. */
export const isBot = (body: { website?: unknown } | null | undefined) => typeof body?.website === "string" && body.website.trim() !== "";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Valida que un string sea un UUID bien formado antes de usarlo en una query. */
export function isValidUuid(value: string | null | undefined): value is string {
  return typeof value === "string" && UUID_RE.test(value);
}

/**
 * MIME types permitidos para los adjuntos de imagen de una pista.
 * Fuente única de verdad del lado del servidor: el cliente es solo
 * conveniencia, la autoridad siempre es esta validación.
 */
export const ALLOWED_IMAGE_MIME = new Set<string>([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
]);

/** Tamaño máximo por archivo (5 MB). */
export const MAX_ATTACH_BYTES = 5 * 1024 * 1024;

/** Cantidad máxima de adjuntos por pista. */
export const MAX_ATTACH_COUNT = 5;

/** ¿El MIME está dentro de la lista de tipos de imagen permitidos? */
export function isValidImageMime(mime: string): boolean {
  return ALLOWED_IMAGE_MIME.has(mime);
}

const MIME_TO_EXTENSION: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/gif": "gif",
  "image/webp": "webp",
};

/**
 * Devuelve la extensión de archivo correspondiente a un MIME de imagen
 * permitido, para armar la ruta del objeto en storage. Si el MIME no está
 * en la lista devuelve `null` (nunca se deriva una extensión de input no
 * validado).
 */
export function getExtensionForMime(mime: string): string | null {
  return MIME_TO_EXTENSION[mime] ?? null;
}

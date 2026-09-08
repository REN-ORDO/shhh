/**
 * Origen canónico del sitio, usado para generar links compartibles
 * (invitación, reveal, etc). Se resuelve con NEXT_PUBLIC_SITE_URL para que
 * los links siempre apunten al dominio de producción, sin importar desde
 * qué deployment (ej. una preview de Vercel) se esté generando el link —
 * esas previews son efímeras y quedan inaccesibles tras el siguiente deploy.
 */
export function getSiteUrl(requestHost?: string | null): string {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (envUrl) return envUrl.replace(/\/$/, "");

  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;

  if (requestHost) {
    const protocol = requestHost.startsWith("localhost") ? "http" : "https";
    return `${protocol}://${requestHost}`;
  }

  return "http://localhost:3000";
}

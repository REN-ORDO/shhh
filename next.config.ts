import type { NextConfig } from "next";

// Host de storage de Supabase. Se deriva de NEXT_PUBLIC_SUPABASE_URL cuando
// está disponible; si no (por ejemplo en un build sin env vars), se usa un
// patrón bien formado de subdominios de supabase.co. El hostname coincide
// con el de la URL del proyecto, que es el mismo que sirve los objetos de
// storage (objetos públicos y signed URLs privadas).
function supabaseStorageHost(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (url) {
    try {
      const hostname = new URL(url).hostname;
      if (hostname) return hostname;
    } catch {
      // fall through al patrón por defecto
    }
  }
  return "*.supabase.co";
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: supabaseStorageHost(),
        // Objetos del bucket privado `clue-images` se sirven a través de
        // signed URLs con la ruta /storage/v1/object/sign/{bucket}/{path}.
        // Los query params (?token=...&expires=...) no se restringen porque
        // son parte del mecanismo de firma.
        pathname: "/storage/v1/object/**",
      },
    ],
  },
};

export default nextConfig;

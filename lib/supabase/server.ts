import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

// Cliente Supabase con sesión (cookies), usando la clave anon (NO service role).
// Se usa para todo lo relacionado a auth y para leer datos que dependen de la
// sesión del usuario (por ejemplo, "mis eventos" en /admin), donde RLS aplica
// de verdad. Para el resto de las operaciones (server actions con permisos
// elevados) se sigue usando `lib/supabase/admin.ts`.
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !anonKey) {
    throw new Error(
      "Faltan variables de entorno de Supabase (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY)."
    );
  }

  return createServerClient(supabaseUrl, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // `setAll` puede fallar si se llama desde un Server Component sin
          // middleware que refresque la sesión. Es seguro ignorarlo si hay
          // middleware manejando el refresh (ver `lib/supabase/middleware.ts`).
        }
      },
    },
  });
}

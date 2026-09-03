import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Cliente con la service role key. SOLO se importa desde Server Actions / Server
// Components. `server-only` hace fallar el build si algún componente cliente
// intenta importar este archivo, evitando que la key llegue al browser.
//
// La inicialización es lazy (vía Proxy) para que `next build` pueda recolectar
// metadata de las rutas sin que las env vars de Supabase estén seteadas todavía;
// el error real solo se lanza si se intenta usar el cliente en runtime sin
// configurar las variables.

let cachedClient: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (cachedClient) return cachedClient;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Faltan variables de entorno de Supabase (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)."
    );
  }

  cachedClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
  return cachedClient;
}

export const supabaseAdmin: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop, receiver) {
    return Reflect.get(getClient(), prop, receiver);
  },
});

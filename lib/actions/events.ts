"use server";

import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isValidUuid } from "@/lib/validate";

export interface FormState {
  error?: string;
}

/**
 * Crea un nuevo evento y redirige al panel de administración.
 * Requiere sesión: sin usuario logueado, redirige a /signup para que el
 * evento quede siempre con `owner_id` seteado.
 */
export async function createEventAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/signup");
  }

  const name = String(formData.get("name") ?? "").trim();
  const adminName = String(user.user_metadata?.name ?? "").trim();
  const adminEmail = String(user.email ?? "").trim();

  if (!name || !adminName || !adminEmail) {
    return { error: "Completa todos los campos para crear tu evento." };
  }

  const { data, error } = await supabaseAdmin
    .from("events")
    .insert({
      name,
      admin_name: adminName,
      admin_email: adminEmail,
      owner_id: user.id,
    })
    .select("admin_token")
    .single();

  if (error || !data) {
    return { error: "No se pudo crear el evento. Intenta de nuevo." };
  }

  redirect(`/admin/${data.admin_token}`);
}

/** Extrae un UUID de un link completo o de un id pegado tal cual. */
function extractUuid(input: string): string | null {
  const match = input.match(
    /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i
  );
  return match ? match[0] : null;
}

/** Redirige a la página de inscripción dado un link o id de evento pegado. */
export async function goToJoinAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const raw = String(formData.get("eventLink") ?? "").trim();
  const eventId = extractUuid(raw);
  if (!eventId || !isValidUuid(eventId)) {
    return { error: "Pega un link de invitación válido." };
  }
  redirect(`/join/${eventId}`);
}

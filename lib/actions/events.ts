"use server";

import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isValidUuid } from "@/lib/validate";
import { generateJoinCode, isValidJoinCode } from "@/lib/join-code";

const MAX_JOIN_CODE_ATTEMPTS = 5;

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

  // El join_code es corto (6 caracteres), así que puede colisionar con uno
  // existente. Reintentamos con un código nuevo unas pocas veces antes de
  // rendirnos.
  for (let attempt = 0; attempt < MAX_JOIN_CODE_ATTEMPTS; attempt++) {
    const { data, error } = await supabaseAdmin
      .from("events")
      .insert({
        name,
        admin_name: adminName,
        admin_email: adminEmail,
        owner_id: user.id,
        join_code: generateJoinCode(),
      })
      .select("admin_token")
      .single();

    if (!error && data) {
      redirect(`/admin/${data.admin_token}`);
    }

    // Código 23505 = unique_violation en Postgres. Si no es por el
    // join_code, no tiene sentido reintentar.
    if (error?.code !== "23505") {
      return { error: "No se pudo crear el evento. Intenta de nuevo." };
    }
  }

  return { error: "No se pudo crear el evento. Intenta de nuevo." };
}

/** Extrae un UUID de un link completo o de un id pegado tal cual. */
function extractUuid(input: string): string | null {
  const match = input.match(
    /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i
  );
  return match ? match[0] : null;
}

const NOT_FOUND_ERROR =
  "No encontramos ningún evento con ese link o código.";

/**
 * Redirige a la página de inscripción dado un link, id de evento, o código
 * corto pegado/escrito por el participante.
 */
export async function goToJoinAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const raw = String(formData.get("eventLink") ?? "").trim();

  const eventId = extractUuid(raw);
  if (eventId) {
    if (!isValidUuid(eventId)) {
      return { error: NOT_FOUND_ERROR };
    }
    redirect(`/join/${eventId}`);
  }

  const code = raw.toUpperCase();
  if (!isValidJoinCode(code)) {
    return { error: NOT_FOUND_ERROR };
  }

  const { data: event } = await supabaseAdmin
    .from("events")
    .select("id")
    .eq("join_code", code)
    .single();

  if (!event) {
    return { error: NOT_FOUND_ERROR };
  }

  redirect(`/join/${event.id}`);
}

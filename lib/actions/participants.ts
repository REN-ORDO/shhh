"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { isValidUuid } from "@/lib/validate";
import type { FormState } from "@/lib/actions/events";

export interface JoinState {
  error?: string;
  accessToken?: string;
}

/** Registra un participante en un evento abierto. */
export async function joinEventAction(
  _prevState: JoinState,
  formData: FormData
): Promise<JoinState> {
  const eventId = String(formData.get("eventId") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();

  if (!isValidUuid(eventId)) {
    return { error: "El evento no es válido." };
  }
  if (!name || !email) {
    return { error: "Completa tu nombre y email." };
  }

  const { data: event, error: eventError } = await supabaseAdmin
    .from("events")
    .select("status")
    .eq("id", eventId)
    .single();

  if (eventError || !event) {
    return { error: "No encontramos ese evento." };
  }
  if (event.status !== "open") {
    return { error: "Las inscripciones para este evento ya están cerradas." };
  }

  const { data, error } = await supabaseAdmin
    .from("participants")
    .insert({ event_id: eventId, name, email })
    .select("access_token")
    .single();

  if (error || !data) {
    return { error: "No se pudo completar la inscripción. Intenta de nuevo." };
  }

  return { accessToken: data.access_token };
}

/** Agrega un participante desde el panel admin (sin necesidad del link público). */
export async function addParticipantAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const eventId = String(formData.get("eventId") ?? "").trim();
  const adminToken = String(formData.get("adminToken") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();

  if (!isValidUuid(eventId) || !isValidUuid(adminToken)) {
    return { error: "Datos inválidos." };
  }
  if (!name || !email) {
    return { error: "Completa nombre y email." };
  }

  const event = await getEventByAdminToken(adminToken);
  if (!event || event.id !== eventId) {
    return { error: "No autorizado." };
  }
  if (event.status !== "open") {
    return { error: "El evento ya cerró inscripciones." };
  }

  const { error } = await supabaseAdmin
    .from("participants")
    .insert({ event_id: eventId, name, email });

  if (error) {
    return { error: "No se pudo agregar el participante." };
  }

  revalidatePath(`/admin/${adminToken}`);
  return {};
}

/** Elimina un participante (solo antes del sorteo). */
export async function removeParticipantAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const participantId = String(formData.get("participantId") ?? "").trim();
  const adminToken = String(formData.get("adminToken") ?? "").trim();

  if (!isValidUuid(participantId) || !isValidUuid(adminToken)) {
    return { error: "Datos inválidos." };
  }

  const event = await getEventByAdminToken(adminToken);
  if (!event) return { error: "No autorizado." };
  if (event.status !== "open") {
    return { error: "No se puede eliminar participantes después del sorteo." };
  }

  const { error } = await supabaseAdmin
    .from("participants")
    .delete()
    .eq("id", participantId)
    .eq("event_id", event.id);

  if (error) return { error: "No se pudo eliminar el participante." };

  revalidatePath(`/admin/${adminToken}`);
  return {};
}

/** Configura las exclusiones de un participante (reemplaza el set completo). */
export async function setExclusionsAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const participantId = String(formData.get("participantId") ?? "").trim();
  const adminToken = String(formData.get("adminToken") ?? "").trim();
  const excludedIds = formData.getAll("excludedIds").map(String);

  if (!isValidUuid(participantId) || !isValidUuid(adminToken)) {
    return { error: "Datos inválidos." };
  }
  for (const id of excludedIds) {
    if (!isValidUuid(id)) return { error: "Datos inválidos." };
  }

  const event = await getEventByAdminToken(adminToken);
  if (!event) return { error: "No autorizado." };
  if (event.status !== "open") {
    return { error: "No se pueden editar exclusiones después del sorteo." };
  }

  await supabaseAdmin
    .from("exclusions")
    .delete()
    .eq("event_id", event.id)
    .eq("participant_id", participantId);

  if (excludedIds.length > 0) {
    const rows = excludedIds.map((excludedId) => ({
      event_id: event.id,
      participant_id: participantId,
      excluded_participant_id: excludedId,
    }));
    const { error } = await supabaseAdmin.from("exclusions").insert(rows);
    if (error) return { error: "No se pudieron guardar las exclusiones." };
  }

  revalidatePath(`/admin/${adminToken}`);
  return {};
}

/** Regenera el access_token de un participante (por si perdió su link). */
export async function regenerateTokenAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const participantId = String(formData.get("participantId") ?? "").trim();
  const adminToken = String(formData.get("adminToken") ?? "").trim();

  if (!isValidUuid(participantId) || !isValidUuid(adminToken)) {
    return { error: "Datos inválidos." };
  }

  const event = await getEventByAdminToken(adminToken);
  if (!event) return { error: "No autorizado." };

  const { error } = await supabaseAdmin
    .from("participants")
    .update({ access_token: crypto.randomUUID() })
    .eq("id", participantId)
    .eq("event_id", event.id);

  if (error) return { error: "No se pudo regenerar el link." };

  revalidatePath(`/admin/${adminToken}`);
  return {};
}

/**
 * Reemplaza a un participante: mismo id (y por lo tanto mismo lugar en el
 * sorteo si ya se hizo), pero nuevo nombre/email y nuevo access_token.
 * Útil si alguien no puede seguir jugando y otra persona lo reemplaza.
 */
export async function replaceParticipantAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const participantId = String(formData.get("participantId") ?? "").trim();
  const adminToken = String(formData.get("adminToken") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();

  if (!isValidUuid(participantId) || !isValidUuid(adminToken)) {
    return { error: "Datos inválidos." };
  }
  if (!name || !email) {
    return { error: "Completa nombre y email." };
  }

  const event = await getEventByAdminToken(adminToken);
  if (!event) return { error: "No autorizado." };

  const { error } = await supabaseAdmin
    .from("participants")
    .update({ name, email, access_token: crypto.randomUUID() })
    .eq("id", participantId)
    .eq("event_id", event.id);

  if (error) return { error: "No se pudo reemplazar el participante." };

  revalidatePath(`/admin/${adminToken}`);
  return {};
}

/** Helper interno: obtiene el evento a partir de un admin_token validado. */
export async function getEventByAdminToken(adminToken: string) {
  if (!isValidUuid(adminToken)) return null;
  const { data } = await supabaseAdmin
    .from("events")
    .select("*")
    .eq("admin_token", adminToken)
    .single();
  return data ?? null;
}

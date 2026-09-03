"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getEventByAdminToken } from "@/lib/actions/participants";
import { computeDerangement } from "@/lib/derangement";
import { isValidUuid } from "@/lib/validate";
import type { FormState } from "@/lib/actions/events";

/** Cierra inscripciones y ejecuta el sorteo respetando exclusiones. */
export async function closeAndDrawAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const adminToken = String(formData.get("adminToken") ?? "").trim();
  if (!isValidUuid(adminToken)) return { error: "Datos inválidos." };

  const event = await getEventByAdminToken(adminToken);
  if (!event) return { error: "No autorizado." };
  if (event.status !== "open") {
    return { error: "El sorteo ya se realizó para este evento." };
  }

  const { data: participants, error: participantsError } = await supabaseAdmin
    .from("participants")
    .select("id")
    .eq("event_id", event.id);

  if (participantsError) {
    return { error: "No se pudo leer la lista de participantes." };
  }

  const participantIds = (participants ?? []).map((p) => p.id);

  if (participantIds.length < 3) {
    return {
      error: "Necesitás al menos 3 participantes inscriptos para poder sortear.",
    };
  }

  const { data: exclusions, error: exclusionsError } = await supabaseAdmin
    .from("exclusions")
    .select("participant_id, excluded_participant_id")
    .eq("event_id", event.id);

  if (exclusionsError) {
    return { error: "No se pudieron leer las exclusiones." };
  }

  const exclusionsByParticipant = new Map<string, Set<string>>();
  for (const row of exclusions ?? []) {
    const set = exclusionsByParticipant.get(row.participant_id) ?? new Set();
    set.add(row.excluded_participant_id);
    exclusionsByParticipant.set(row.participant_id, set);
  }

  const result = computeDerangement({ participantIds, exclusionsByParticipant });

  if (!result.ok) {
    return { error: result.reason };
  }

  const rows = Array.from(result.assignment.entries()).map(
    ([giverId, receiverId]) => ({
      event_id: event.id,
      giver_id: giverId,
      receiver_id: receiverId,
    })
  );

  const { error: insertError } = await supabaseAdmin
    .from("assignments")
    .insert(rows);

  if (insertError) {
    return { error: "No se pudo guardar el resultado del sorteo." };
  }

  const { error: closeError } = await supabaseAdmin
    .from("events")
    .update({ status: "closed" })
    .eq("id", event.id);

  if (closeError) {
    return { error: "El sorteo se guardó pero no se pudo cerrar el evento." };
  }

  revalidatePath(`/admin/${adminToken}`);
  return {};
}

"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { isValidUuid } from "@/lib/validate";
import type { FormState } from "@/lib/actions/events";

/**
 * Guarda una pista anónima dirigida al receiver del participante que la
 * envía. La tabla `clues` no tiene columna de remitente: nunca se guarda
 * quién la escribió, solo a quién va dirigida.
 */
export async function sendClueAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const accessToken = String(formData.get("accessToken") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (!isValidUuid(accessToken)) return { error: "Link inválido." };
  if (!message) return { error: "Escribí un mensaje antes de enviar." };
  if (message.length > 500) {
    return { error: "El mensaje es muy largo (máximo 500 caracteres)." };
  }

  const { data: participant, error: participantError } = await supabaseAdmin
    .from("participants")
    .select("id, event_id")
    .eq("access_token", accessToken)
    .single();

  if (participantError || !participant) {
    return { error: "No encontramos tu inscripción." };
  }

  const { data: assignment, error: assignmentError } = await supabaseAdmin
    .from("assignments")
    .select("receiver_id")
    .eq("event_id", participant.event_id)
    .eq("giver_id", participant.id)
    .single();

  if (assignmentError || !assignment) {
    return { error: "Todavía no se hizo el sorteo para este evento." };
  }

  const { error } = await supabaseAdmin.from("clues").insert({
    event_id: participant.event_id,
    receiver_id: assignment.receiver_id,
    message,
  });

  if (error) return { error: "No se pudo enviar la pista." };

  revalidatePath(`/reveal/${accessToken}`);
  return {};
}

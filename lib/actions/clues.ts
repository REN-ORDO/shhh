"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase/admin";
import {
  isValidUuid,
  isValidImageMime,
  getExtensionForMime,
  MAX_ATTACH_BYTES,
  MAX_ATTACH_COUNT,
} from "@/lib/validate";
import type { FormState } from "@/lib/actions/events";

const ATTACH_BUCKET = "clue-images";

/**
 * Guarda una pista anónima dirigida al receiver del participante que la
 * envía. La tabla `clues` no tiene columna de remitente: nunca se guarda
 * quién la escribió, solo a quién va dirigida. Lo mismo aplica a los
 * adjuntos: se suben a un bucket privado con rutas que solo contienen UUIDs
 * (evento/pista/attachment), sin ninguna identidad del emisor.
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

  // Los archivos se leen de la clave `attachments` del FormData (input
  // multiple). El cliente filtra por conveniencia, pero la autoridad de
  // validación es este código del lado del servidor.
  const files = (formData.getAll("attachments") as File[]).filter(
    (f) => f instanceof File && f.size > 0
  );

  const attachmentsError = validateAttachments(files);
  if (attachmentsError) return { error: attachmentsError };

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

  const {
    data: clue,
    error: clueError,
  } = await supabaseAdmin
    .from("clues")
    .insert({
      event_id: participant.event_id,
      receiver_id: assignment.receiver_id,
      message,
    })
    .select("id")
    .single();

  if (clueError || !clue) {
    return { error: "No se pudo enviar la pista." };
  }

  if (files.length > 0) {
    // Sube cada archivo y registra su fila. Si algo falla a mitad de camino,
    // limpia (best-effort) los objetos ya subidos para no dejar basura.
    const uploadedPaths: string[] = [];
    try {
      for (const file of files) {
        const attachmentId = crypto.randomUUID();
        const extension = getExtensionForMime(file.type);
        if (!extension) {
          throw new Error("MIME no permitido.");
        }
        const path = `${participant.event_id}/${clue.id}/${attachmentId}/original.${extension}`;

        const { error: uploadError } = await supabaseAdmin.storage
          .from(ATTACH_BUCKET)
          .upload(path, file, {
            contentType: file.type,
            cacheControl: "3600",
            // Sin owner ni metadata de usuario: se preserva el anonimato.
            upsert: false,
          });

        if (uploadError) throw uploadError;
        uploadedPaths.push(path);

        const { error: insertError } = await supabaseAdmin
          .from("clue_attachments")
          .insert({
            clue_id: clue.id,
            bucket: ATTACH_BUCKET,
            path,
            mime_type: file.type,
            size_bytes: file.size,
          });

        if (insertError) throw insertError;
      }
    } catch {
      // Best-effort: remover los objetos ya subidos de este envío.
      if (uploadedPaths.length > 0) {
        await supabaseAdmin.storage
          .from(ATTACH_BUCKET)
          .remove(uploadedPaths);
      }
      return { error: "No se pudieron subir las imágenes." };
    }
  }

  revalidatePath(`/reveal/${accessToken}`);
  return {};
}

/**
 * Valida los archivos adjuntos del lado del servidor: tipos permitidos,
 * tamaño máximo por archivo y cantidad máxima. Devuelve un mensaje de error
 * o `null` si todo está bien.
 */
function validateAttachments(files: File[]): string | null {
  if (files.length > MAX_ATTACH_COUNT) {
    return `Podés adjuntar hasta ${MAX_ATTACH_COUNT} imágenes.`;
  }
  for (const file of files) {
    if (!isValidImageMime(file.type)) {
      return "Solo se aceptan imágenes (JPG, PNG, GIF o WebP).";
    }
    if (file.size > MAX_ATTACH_BYTES) {
      return "Cada imagen debe pesar menos de 5 MB.";
    }
  }
  return null;
}

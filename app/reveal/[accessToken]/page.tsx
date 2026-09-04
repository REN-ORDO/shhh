import { notFound } from "next/navigation";
import { Hand, Gift } from "lucide-react";
import Image from "next/image";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { isValidUuid } from "@/lib/validate";
import { SendClueForm } from "@/components/SendClueForm";
import type { ClueAttachmentRow } from "@/lib/types";

const ATTACH_BUCKET = "clue-images";
const SIGNED_URL_TTL = 3600; // segundos

export default async function RevealPage({
  params,
}: {
  params: Promise<{ accessToken: string }>;
}) {
  const { accessToken } = await params;

  if (!isValidUuid(accessToken)) notFound();

  const { data: participant } = await supabaseAdmin
    .from("participants")
    .select("id, name, event_id")
    .eq("access_token", accessToken)
    .single();

  if (!participant) notFound();

  const { data: event } = await supabaseAdmin
    .from("events")
    .select("id, name, admin_name, status")
    .eq("id", participant.event_id)
    .single();

  if (!event) notFound();

  // Trackear último acceso (best-effort, no bloquea el render)
  await supabaseAdmin
    .from("participants")
    .update({ last_accessed_at: new Date().toISOString() })
    .eq("id", participant.id);

  let receiverName: string | null = null;
  if (event.status === "closed") {
    const { data: assignment } = await supabaseAdmin
      .from("assignments")
      .select("receiver_id")
      .eq("event_id", event.id)
      .eq("giver_id", participant.id)
      .single();

    if (assignment) {
      const { data: receiver } = await supabaseAdmin
        .from("participants")
        .select("name")
        .eq("id", assignment.receiver_id)
        .single();
      receiverName = receiver?.name ?? null;
    }
  }

  const { data: inboxClues } = await supabaseAdmin
    .from("clues")
    .select("id, message, created_at")
    .eq("receiver_id", participant.id)
    .order("created_at", { ascending: false });

  // Adjuntos: una sola query batcheada para todas las pistas (evita N+1) y
  // signed URLs de corta duración generadas con la service role key para
  // servir los objetos del bucket privado.
  const attachmentsByClue = await fetchAttachmentsByClue(
    inboxClues?.map((c) => c.id) ?? []
  );

  return (
    <div className="flex flex-col items-center gap-8 px-6 py-16 max-w-xl mx-auto">
      <span className="nb-pill">{event.name}</span>
      <h1 className="text-2xl font-extrabold text-center flex items-center gap-2">
        Hola, {participant.name}
        <Hand className="size-6 text-accent" aria-hidden="true" />
      </h1>

      {event.status !== "closed" ? (
        <div className="nb-card p-6 w-full text-center">
          <p className="font-bold">El sorteo todavía no se hizo.</p>
          <p className="text-sm text-muted mt-2">
            En cuanto {event.admin_name} cierre las inscripciones y sortee,
            vas a ver acá a quién te toca regalarle. Vuelve a este mismo link
            más tarde.
          </p>
        </div>
      ) : (
        <>
          <div className="nb-card p-6 w-full text-center">
            <p className="text-sm text-muted mb-1">Te tocó regalarle a:</p>
            <p className="text-3xl font-extrabold text-accent">
              {receiverName ?? "—"}
            </p>
          </div>

          <div className="w-full flex flex-col gap-6">
            <SendClueForm accessToken={accessToken} />

            <div className="nb-card p-5 flex flex-col gap-3">
              <h3 className="font-extrabold flex items-center gap-2">
                <Gift className="size-4 text-accent" aria-hidden="true" />
                Mensajes de tu Amigo Secreto
              </h3>
              {!inboxClues || inboxClues.length === 0 ? (
                <p className="text-sm text-muted">
                  Todavía no recibiste ninguna pista.
                </p>
              ) : (
                <ul className="flex flex-col gap-4">
                  {inboxClues.map((clue) => (
                    <li
                      key={clue.id}
                      className="border-2 border-border rounded-lg px-3 py-2 bg-accent-light text-sm flex flex-col gap-2"
                    >
                      <p>{clue.message}</p>
                      {attachmentsByClue.get(clue.id)?.map((att) => (
                        <div
                          key={att.id}
                          className="relative w-full aspect-video overflow-hidden rounded-md"
                        >
                          <Image
                            src={att.signedUrl}
                            alt="Imagen adjunta a la pista"
                            fill
                            sizes="(min-width: 640px) 576px, 100vw"
                            className="object-cover"
                          />
                        </div>
                      ))}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/**
 * Trae todos los adjuntos de las pistas en una sola query batcheada
 * (`clue_id IN (...)`) y les genera signed URLs de corta duración con la
 * service role key. Devuelve un Map `clue_id -> [{ id, signedUrl }]`.
 */
async function fetchAttachmentsByClue(
  clueIds: string[]
): Promise<Map<string, { id: string; signedUrl: string }[]>> {
  const result = new Map<string, { id: string; signedUrl: string }[]>();
  if (clueIds.length === 0) return result;

  const { data: attachments } = await supabaseAdmin
    .from("clue_attachments")
    .select("id, clue_id, bucket, path")
    .in("clue_id", clueIds);

  if (!attachments) return result;

  for (const row of attachments as Pick<
    ClueAttachmentRow,
    "id" | "clue_id" | "bucket" | "path"
  >[]) {
    const { data: signed, error } = await supabaseAdmin.storage
      .from(ATTACH_BUCKET)
      .createSignedUrl(row.path, SIGNED_URL_TTL);

    if (error || !signed) continue;

    const list = result.get(row.clue_id) ?? [];
    list.push({ id: row.id, signedUrl: signed.signedUrl });
    result.set(row.clue_id, list);
  }

  return result;
}

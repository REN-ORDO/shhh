import { notFound } from "next/navigation";
import { Hand, Gift } from "lucide-react";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { isValidUuid } from "@/lib/validate";
import { SendClueForm } from "@/components/SendClueForm";

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
                <ul className="flex flex-col gap-2">
                  {inboxClues.map((clue) => (
                    <li
                      key={clue.id}
                      className="border-2 border-border rounded-lg px-3 py-2 bg-accent-light text-sm"
                    >
                      {clue.message}
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

import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { isValidUuid } from "@/lib/validate";
import { AutoRefresh } from "@/components/AutoRefresh";
import { AddParticipantForm } from "@/components/AddParticipantForm";
import { ParticipantRow } from "@/components/ParticipantRow";
import { DrawButton } from "@/components/DrawButton";
import type { ExclusionRow, ParticipantRow as ParticipantRowType } from "@/lib/types";

export default async function AdminPage({
  params,
}: {
  params: Promise<{ adminToken: string }>;
}) {
  const { adminToken } = await params;

  if (!isValidUuid(adminToken)) notFound();

  const { data: event } = await supabaseAdmin
    .from("events")
    .select("*")
    .eq("admin_token", adminToken)
    .single();

  if (!event) notFound();

  const { data: participants } = await supabaseAdmin
    .from("participants")
    .select("*")
    .eq("event_id", event.id)
    .order("joined_at", { ascending: true });

  const list: ParticipantRowType[] = participants ?? [];

  const { data: exclusions } = await supabaseAdmin
    .from("exclusions")
    .select("*")
    .eq("event_id", event.id);

  const exclusionsList: ExclusionRow[] = exclusions ?? [];
  const exclusionsByParticipant = new Map<string, string[]>();
  for (const ex of exclusionsList) {
    const arr = exclusionsByParticipant.get(ex.participant_id) ?? [];
    arr.push(ex.excluded_participant_id);
    exclusionsByParticipant.set(ex.participant_id, arr);
  }

  const isOpen = event.status === "open";

  let receiverByGiver = new Map<string, string>();
  let cluesCount = 0;

  if (!isOpen) {
    const { data: assignments } = await supabaseAdmin
      .from("assignments")
      .select("giver_id, receiver_id")
      .eq("event_id", event.id);

    const nameById = new Map(list.map((p) => [p.id, p.name]));
    receiverByGiver = new Map(
      (assignments ?? []).map((a) => [a.giver_id, nameById.get(a.receiver_id) ?? "—"])
    );

    const { count } = await supabaseAdmin
      .from("clues")
      .select("id", { count: "exact", head: true })
      .eq("event_id", event.id);
    cluesCount = count ?? 0;
  }

  const joinLink = `/join/${event.id}`;

  return (
    <div className="flex flex-col gap-8 px-6 py-12 max-w-3xl mx-auto">
      <AutoRefresh />

      <div className="flex flex-col gap-2">
        <span className="nb-pill self-start">Panel de administración</span>
        <h1 className="text-3xl font-extrabold">{event.name}</h1>
        <p className="text-muted">Organiza {event.admin_name}.</p>
      </div>

      {/* Dashboard resumen */}
      <div className="nb-card p-5 flex flex-col gap-2">
        <h2 className="font-extrabold text-lg">Resumen</h2>
        <ul className="divide-y-2 divide-border/20 text-sm">
          <li className="py-2 flex justify-between">
            <span>Estado</span>
            <span className="font-bold">
              {isOpen ? "Inscripciones abiertas" : "Sorteo realizado"}
            </span>
          </li>
          <li className="py-2 flex justify-between">
            <span>Inscriptos</span>
            <span className="font-bold">{list.length}</span>
          </li>
          {!isOpen && (
            <li className="py-2 flex justify-between">
              <span>Pistas enviadas</span>
              <span className="font-bold">{cluesCount}</span>
            </li>
          )}
        </ul>
      </div>

      {isOpen && (
        <div className="nb-card p-5 flex flex-col gap-3">
          <h2 className="font-extrabold text-lg">Link de invitación</h2>
          <p className="text-sm text-muted">
            Comparte este link con los participantes para que se inscriban:
          </p>
          <code className="border-2 border-border rounded-lg px-3 py-2 bg-white text-sm break-all">
            {joinLink}
          </code>
        </div>
      )}

      {isOpen && (
        <div className="nb-card p-5 flex flex-col gap-3">
          <h2 className="font-extrabold text-lg">Agregar participante</h2>
          <AddParticipantForm eventId={event.id} adminToken={adminToken} />
        </div>
      )}

      <div className="nb-card p-5 flex flex-col gap-3">
        <h2 className="font-extrabold text-lg">
          Participantes ({list.length})
        </h2>
        {list.length === 0 ? (
          <p className="text-sm text-muted">Todavía no hay nadie inscripto.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {list.map((p) => (
              <ParticipantRow
                key={p.id}
                participant={p}
                allParticipants={list}
                excludedIds={exclusionsByParticipant.get(p.id) ?? []}
                isOpen={isOpen}
                adminToken={adminToken}
                receiverName={receiverByGiver.get(p.id)}
              />
            ))}
          </ul>
        )}
      </div>

      {isOpen && list.length >= 3 && (
        <div className="nb-card p-5 flex flex-col gap-3">
          <h2 className="font-extrabold text-lg">Sorteo</h2>
          <p className="text-sm text-muted">
            Una vez que cierres inscripciones y sortees, no vas a poder agregar
            ni eliminar participantes.
          </p>
          <DrawButton adminToken={adminToken} />
        </div>
      )}

      {isOpen && list.length < 3 && (
        <p className="text-sm text-muted text-center">
          Necesitas al menos 3 participantes inscriptos para poder sortear.
        </p>
      )}
    </div>
  );
}

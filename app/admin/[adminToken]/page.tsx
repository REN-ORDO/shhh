import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { isValidUuid } from "@/lib/validate";
import { AutoRefresh } from "@/components/AutoRefresh";
import { AddParticipantForm } from "@/components/AddParticipantForm";
import { ParticipantRow } from "@/components/ParticipantRow";
import { ParticipantsPagination } from "@/components/ParticipantsPagination";
import { DrawButton } from "@/components/DrawButton";
import { ShareInviteButton } from "@/components/ShareInviteButton";
import { CopyField } from "@/components/CopyField";
import type { ExclusionRow, ParticipantRow as ParticipantRowType } from "@/lib/types";

const PARTICIPANTS_PER_PAGE = 8;

export default async function AdminPage({
  params,
  searchParams,
}: {
  params: Promise<{ adminToken: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { adminToken } = await params;
  const { page } = await searchParams;

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

  const totalPages = Math.max(1, Math.ceil(list.length / PARTICIPANTS_PER_PAGE));
  const currentPage = Math.min(Math.max(1, Number(page) || 1), totalPages);
  const pageStart = (currentPage - 1) * PARTICIPANTS_PER_PAGE;
  const pageList = list.slice(pageStart, pageStart + PARTICIPANTS_PER_PAGE);

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

  const headersList = await headers();
  const host = headersList.get("host");
  const protocol = host?.startsWith("localhost") ? "http" : "https";
  const origin = host ? `${protocol}://${host}` : "";

  const joinPath = `/join/${event.id}`;
  const joinLink = `${origin}${joinPath}`;

  return (
    <div className="flex flex-col gap-8 px-6 sm:px-8 lg:px-10 py-12 lg:py-16 max-w-6xl mx-auto">
      <AutoRefresh />

      <div className="flex flex-col gap-3">
        <span className="nb-pill self-start">Panel de administración</span>
        <h1 className="text-3xl lg:text-4xl font-extrabold">{event.name}</h1>
        <p className="text-muted">Organiza {event.admin_name}.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        {/* Columna lateral: resumen, invitación y alta de participantes */}
        <div className="flex flex-col gap-6">
          <div className="nb-card p-6 sm:p-8 flex flex-col gap-3">
            <h2 className="font-extrabold text-lg">Resumen</h2>
            <ul className="divide-y-2 divide-border/20 text-sm">
              <li className="py-3 flex justify-between">
                <span>Estado</span>
                <span className="font-bold">
                  {isOpen ? "Inscripciones abiertas" : "Sorteo realizado"}
                </span>
              </li>
              <li className="py-3 flex justify-between">
                <span>Inscriptos</span>
                <span className="font-bold">{list.length}</span>
              </li>
              {!isOpen && (
                <li className="py-3 flex justify-between">
                  <span>Pistas enviadas</span>
                  <span className="font-bold">{cluesCount}</span>
                </li>
              )}
            </ul>
          </div>

          {isOpen && (
            <div className="nb-card p-6 sm:p-8 flex flex-col gap-4">
              <h2 className="font-extrabold text-lg">Link de invitación</h2>
              <p className="text-sm text-muted">
                Comparte este link con los participantes para que se inscriban:
              </p>
              <CopyField value={joinLink} />
              {event.join_code && (
                <>
                  <p className="text-sm text-muted">
                    O comparte este código para que lo escriban a mano en la
                    página principal:
                  </p>
                  <CopyField
                    value={event.join_code}
                    codeClassName="font-extrabold tracking-widest text-center"
                  />
                </>
              )}
              <ShareInviteButton
                adminName={event.admin_name}
                eventName={event.name}
                joinLink={joinLink}
                joinCode={event.join_code}
              />
            </div>
          )}

          {isOpen && (
            <div className="nb-card p-6 sm:p-8 flex flex-col gap-4">
              <h2 className="font-extrabold text-lg">Agregar participante</h2>
              <AddParticipantForm eventId={event.id} adminToken={adminToken} />
            </div>
          )}
        </div>

        {/* Columna principal: participantes y sorteo */}
        <div className="flex flex-col gap-6">
          <div className="nb-card p-6 sm:p-8 flex flex-col gap-4 flex-1">
            <h2 className="font-extrabold text-lg">
              Participantes ({list.length})
            </h2>
            {list.length === 0 ? (
              <p className="text-sm text-muted">Todavía no hay nadie inscripto.</p>
            ) : (
              <>
                <ul className="grid sm:grid-cols-2 gap-4 content-start flex-1">
                  {pageList.map((p) => (
                    <ParticipantRow
                      key={p.id}
                      participant={p}
                      allParticipants={list}
                      excludedIds={exclusionsByParticipant.get(p.id) ?? []}
                      isOpen={isOpen}
                      adminToken={adminToken}
                      receiverName={receiverByGiver.get(p.id)}
                      origin={origin}
                    />
                  ))}
                </ul>
                {totalPages > 1 && (
                  <ParticipantsPagination
                    adminToken={adminToken}
                    currentPage={currentPage}
                    totalPages={totalPages}
                  />
                )}
              </>
            )}
          </div>

          {isOpen && list.length >= 3 && (
            <div className="nb-card p-6 sm:p-8 flex flex-col gap-4">
              <h2 className="font-extrabold text-lg">Sorteo</h2>
              <p className="text-sm text-muted">
                Una vez que cierres inscripciones y sortees, no vas a poder
                agregar ni eliminar participantes.
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
      </div>
    </div>
  );
}

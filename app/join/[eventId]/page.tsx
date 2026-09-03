import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { isValidUuid } from "@/lib/validate";
import { JoinForm } from "@/components/JoinForm";

export default async function JoinPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;

  if (!isValidUuid(eventId)) notFound();

  const { data: event } = await supabaseAdmin
    .from("events")
    .select("id, name, admin_name, status")
    .eq("id", eventId)
    .single();

  if (!event) notFound();

  return (
    <div className="flex flex-col items-center gap-6 px-6 py-16">
      <span className="nb-pill">Amigo Secreto Virtual</span>
      <h1 className="text-3xl font-extrabold text-center">{event.name}</h1>
      <p className="text-muted text-center max-w-md">
        {event.admin_name} te invitó a jugar Amigo Secreto. Completá tus datos
        para sumarte al sorteo.
      </p>

      {event.status !== "open" ? (
        <div className="nb-card p-6 max-w-md text-center">
          <p className="font-bold">Las inscripciones para este evento ya cerraron.</p>
          <p className="text-sm text-muted mt-2">
            Si crees que es un error, contactá a {event.admin_name}, quien
            organiza el evento.
          </p>
        </div>
      ) : (
        <JoinForm eventId={event.id} />
      )}
    </div>
  );
}

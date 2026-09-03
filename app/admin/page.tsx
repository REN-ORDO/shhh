import Link from "next/link";
import { redirect } from "next/navigation";
import { Gift, Plus } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { signOutAction } from "@/lib/actions/auth";
import type { EventRow } from "@/lib/types";

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Se usa el cliente con sesión (no el de service role) para que RLS
  // restrinja naturalmente el resultado a los eventos del usuario logueado.
  const { data: events } = await supabase
    .from("events")
    .select("*")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  const list: EventRow[] = events ?? [];

  return (
    <div className="flex flex-col gap-10 px-6 sm:px-8 lg:px-10 py-12 lg:py-16 max-w-5xl mx-auto">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <span className="nb-pill self-start">Mis eventos</span>
          <h1 className="text-2xl lg:text-3xl font-extrabold">Hola, {String(user.user_metadata?.name ?? user.email)}</h1>
        </div>
        <form action={signOutAction}>
          <button type="submit" className="nb-btn nb-btn-secondary px-4 py-2 text-sm">
            Cerrar sesión
          </button>
        </form>
      </div>

      {list.length === 0 ? (
        <div className="nb-card p-8 sm:p-12 flex flex-col items-center gap-4 text-center">
          <Gift className="size-8" aria-hidden="true" />
          <p className="text-muted">Todavía no creaste ningún evento.</p>
          <Link href="/#top" className="nb-btn nb-btn-primary px-5 py-3 flex items-center gap-2">
            <Plus className="size-4" aria-hidden="true" />
            Crear nuevo evento
          </Link>
        </div>
      ) : (
        <>
          <Link
            href="/#top"
            className="nb-btn nb-btn-primary px-5 py-3 self-start flex items-center gap-2"
          >
            <Plus className="size-4" aria-hidden="true" />
            Crear nuevo evento
          </Link>

          <ul className="grid sm:grid-cols-2 gap-4">
            {list.map((event) => (
              <li key={event.id}>
                <Link
                  href={`/admin/${event.admin_token}`}
                  className="nb-card p-6 flex items-center justify-between gap-4 block hover:opacity-90 h-full"
                >
                  <div className="flex flex-col gap-1">
                    <span className="font-extrabold">{event.name}</span>
                    <span className="text-sm text-muted">
                      {event.status === "open" ? "Inscripciones abiertas" : "Sorteo realizado"}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

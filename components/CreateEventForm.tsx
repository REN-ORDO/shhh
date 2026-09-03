"use client";

import { useActionState } from "react";
import { Gift } from "lucide-react";
import { createEventAction, type FormState } from "@/lib/actions/events";

const initialState: FormState = {};

interface CreateEventFormProps {
  /** Nombre del organizador logueado, para prellenar el campo. */
  defaultAdminName?: string;
  /** Email del organizador logueado, mostrado solo a modo informativo. */
  organizerEmail?: string;
}

export function CreateEventForm({
  defaultAdminName,
  organizerEmail,
}: CreateEventFormProps = {}) {
  const [state, formAction, pending] = useActionState(
    createEventAction,
    initialState
  );

  return (
    <form action={formAction} className="nb-card p-6 flex flex-col gap-4 w-full max-w-md">
      <h3 className="text-xl font-extrabold">Crea tu evento</h3>
      <div className="flex flex-col gap-1">
        <label htmlFor="name" className="text-sm font-bold">
          Nombre del evento
        </label>
        <input
          id="name"
          name="name"
          required
          placeholder="Amigo Secreto Oficina 2026"
          className="border-2 border-border rounded-lg px-3 py-2 bg-white"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="adminName" className="text-sm font-bold">
          Tu nombre (organizador/a)
        </label>
        <input
          id="adminName"
          name="adminName"
          required
          defaultValue={defaultAdminName}
          placeholder="Tu nombre"
          className="border-2 border-border rounded-lg px-3 py-2 bg-white"
        />
      </div>
      {organizerEmail ? (
        <p className="text-sm text-muted">
          Vas a crear este evento como <span className="font-bold">{organizerEmail}</span>.
        </p>
      ) : (
        <p className="text-sm text-muted">
          Necesitas una cuenta para crear un evento — te vamos a pedir que te
          registres o inicies sesión al confirmar.
        </p>
      )}
      {state.error && <p className="text-accent font-bold text-sm">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="nb-btn nb-btn-primary px-5 py-3 disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {pending ? (
          "Creando..."
        ) : (
          <>
            <Gift className="size-4" aria-hidden="true" />
            Crear mi evento
          </>
        )}
      </button>
    </form>
  );
}

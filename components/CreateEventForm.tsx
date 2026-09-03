"use client";

import { useActionState } from "react";
import { Gift } from "lucide-react";
import { createEventAction, type FormState } from "@/lib/actions/events";

const initialState: FormState = {};

export function CreateEventForm() {
  const [state, formAction, pending] = useActionState(
    createEventAction,
    initialState
  );

  return (
    <form action={formAction} className="nb-card p-6 flex flex-col gap-4 w-full max-w-md">
      <h3 className="text-xl font-extrabold">Creá tu evento</h3>
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
          placeholder="Tu nombre"
          className="border-2 border-border rounded-lg px-3 py-2 bg-white"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="adminEmail" className="text-sm font-bold">
          Tu email
        </label>
        <input
          id="adminEmail"
          name="adminEmail"
          type="email"
          required
          placeholder="vos@ejemplo.com"
          className="border-2 border-border rounded-lg px-3 py-2 bg-white"
        />
      </div>
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

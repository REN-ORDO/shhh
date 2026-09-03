"use client";

import { useActionState } from "react";
import { closeAndDrawAction } from "@/lib/actions/draw";
import type { FormState } from "@/lib/actions/events";

const initialState: FormState = {};

export function DrawButton({ adminToken }: { adminToken: string }) {
  const [state, formAction, pending] = useActionState(
    closeAndDrawAction,
    initialState
  );

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <input type="hidden" name="adminToken" value={adminToken} />
      {state.error && <p className="text-accent font-bold text-sm">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        onClick={(e) => {
          if (!confirm("¿Cerrar inscripciones y sortear? Esta acción no se puede deshacer.")) {
            e.preventDefault();
          }
        }}
        className="nb-btn nb-btn-primary px-5 py-3 disabled:opacity-60"
      >
        {pending ? "Sorteando..." : "Cerrar inscripciones y sortear 🎲"}
      </button>
    </form>
  );
}

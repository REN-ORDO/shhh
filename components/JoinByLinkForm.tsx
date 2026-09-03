"use client";

import { useActionState } from "react";
import { goToJoinAction } from "@/lib/actions/events";
import type { FormState } from "@/lib/actions/events";

const initialState: FormState = {};

export function JoinByLinkForm() {
  const [state, formAction, pending] = useActionState(
    goToJoinAction,
    initialState
  );

  return (
    <form action={formAction} className="nb-card p-6 flex flex-col gap-4 w-full max-w-md">
      <h3 className="text-xl font-extrabold">¿Ya te invitaron?</h3>
      <p className="text-sm text-muted">
        Pegá el link de invitación que te compartió el organizador.
      </p>
      <input
        name="eventLink"
        required
        placeholder="https://.../join/xxxxxxxx-xxxx-..."
        className="border-2 border-border rounded-lg px-3 py-2 bg-white"
      />
      {state.error && <p className="text-accent font-bold text-sm">{state.error}</p>}
      <button type="submit" disabled={pending} className="nb-btn nb-btn-secondary px-5 py-3 disabled:opacity-60">
        {pending ? "Buscando..." : "Ir a inscribirme"}
      </button>
    </form>
  );
}

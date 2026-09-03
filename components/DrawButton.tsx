"use client";

import { useActionState } from "react";
import { Dices } from "lucide-react";
import { closeAndDrawAction } from "@/lib/actions/draw";
import type { FormState } from "@/lib/actions/events";
import { ConfirmButton } from "@/components/ConfirmButton";

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
      <ConfirmButton
        pending={pending}
        pendingLabel="Sorteando..."
        title="¿Cerrar inscripciones y sortear?"
        description="Ya no vas a poder agregar ni eliminar participantes. El sorteo se hace una sola vez y esta acción no se puede deshacer."
        confirmLabel="Sí, sortear"
        className="nb-btn nb-btn-primary px-5 py-3 disabled:opacity-60 flex items-center justify-center gap-2"
      >
        <Dices className="size-4" aria-hidden="true" />
        Cerrar inscripciones y sortear
      </ConfirmButton>
    </form>
  );
}

"use client";

import { useActionState, useRef } from "react";
import { addParticipantAction } from "@/lib/actions/participants";
import type { FormState } from "@/lib/actions/events";

const initialState: FormState = {};

export function AddParticipantForm({
  eventId,
  adminToken,
}: {
  eventId: string;
  adminToken: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(async (
    prev: FormState,
    formData: FormData
  ) => {
    const result = await addParticipantAction(prev, formData);
    if (!result.error) formRef.current?.reset();
    return result;
  }, initialState);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-2">
      <input type="hidden" name="eventId" value={eventId} />
      <input type="hidden" name="adminToken" value={adminToken} />
      <input
        name="name"
        required
        placeholder="Nombre"
        className="border-2 border-border rounded-lg px-3 py-2 bg-white w-full"
      />
      <input
        name="email"
        type="email"
        required
        placeholder="Email"
        className="border-2 border-border rounded-lg px-3 py-2 bg-white w-full"
      />
      <button type="submit" disabled={pending} className="nb-btn nb-btn-primary px-4 py-2 disabled:opacity-60">
        {pending ? "Agregando..." : "Agregar"}
      </button>
      {state.error && <p className="text-accent font-bold text-sm">{state.error}</p>}
    </form>
  );
}

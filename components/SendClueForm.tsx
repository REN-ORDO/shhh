"use client";

import { useActionState, useRef } from "react";
import { MessageCircleHeart } from "lucide-react";
import { sendClueAction } from "@/lib/actions/clues";
import type { FormState } from "@/lib/actions/events";

const initialState: FormState = {};

export function SendClueForm({ accessToken }: { accessToken: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(async (
    prev: FormState,
    formData: FormData
  ) => {
    const result = await sendClueAction(prev, formData);
    if (!result.error) formRef.current?.reset();
    return result;
  }, initialState);

  return (
    <form ref={formRef} action={formAction} className="nb-card p-5 flex flex-col gap-3">
      <input type="hidden" name="accessToken" value={accessToken} />
      <h3 className="font-extrabold flex items-center gap-2">
        <MessageCircleHeart className="size-4 text-accent" aria-hidden="true" />
        Mándale una pista anónima
      </h3>
      <p className="text-sm text-muted">
        Tu mensaje se envía sin tu nombre: la otra persona nunca sabrá que lo
        mandaste tú.
      </p>
      <textarea
        name="message"
        required
        maxLength={500}
        rows={3}
        placeholder="Ej: me gustan los libros de fantasía..."
        className="border-2 border-border rounded-lg px-3 py-2 bg-white resize-none"
      />
      {state.error && <p className="text-accent font-bold text-sm">{state.error}</p>}
      <button type="submit" disabled={pending} className="nb-btn nb-btn-primary px-5 py-2 self-start disabled:opacity-60">
        {pending ? "Enviando..." : "Enviar pista"}
      </button>
    </form>
  );
}

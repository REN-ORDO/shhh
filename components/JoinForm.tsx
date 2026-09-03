"use client";

import { useActionState, useState } from "react";
import { PartyPopper, Check, Gift } from "lucide-react";
import { joinEventAction, type JoinState } from "@/lib/actions/participants";

const initialState: JoinState = {};

export function JoinForm({ eventId }: { eventId: string }) {
  const [state, formAction, pending] = useActionState(
    joinEventAction,
    initialState
  );
  const [copied, setCopied] = useState(false);

  if (state.accessToken) {
    const link =
      typeof window !== "undefined"
        ? `${window.location.origin}/reveal/${state.accessToken}`
        : `/reveal/${state.accessToken}`;

    return (
      <div className="nb-card p-6 flex flex-col gap-4 w-full max-w-md">
        <h3 className="text-xl font-extrabold flex items-center gap-2">
          <PartyPopper className="size-5 text-accent" aria-hidden="true" />
          ¡Listo, ya estás inscripto/a!
        </h3>
        <p className="text-sm text-muted">
          Guarda este link: es tu acceso personal y secreto para ver a quién te
          toca regalarle (cuando se haga el sorteo) y para mandar/recibir
          pistas anónimas.
        </p>
        <div className="border-2 border-border rounded-lg px-3 py-2 bg-white break-all text-sm">
          {link}
        </div>
        <button
          type="button"
          className="nb-btn nb-btn-primary px-5 py-3 flex items-center justify-center gap-2"
          onClick={async () => {
            await navigator.clipboard.writeText(link);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }}
        >
          {copied && <Check className="size-4" aria-hidden="true" />}
          {copied ? "¡Copiado!" : "Copiar mi link"}
        </button>
        <a href={link} className="nb-btn nb-btn-secondary px-5 py-3 text-center">
          Ir a mi link ahora
        </a>
      </div>
    );
  }

  return (
    <form action={formAction} className="nb-card p-6 flex flex-col gap-4 w-full max-w-md">
      <input type="hidden" name="eventId" value={eventId} />
      <div className="flex flex-col gap-1">
        <label htmlFor="name" className="text-sm font-bold">
          Tu nombre
        </label>
        <input
          id="name"
          name="name"
          required
          className="border-2 border-border rounded-lg px-3 py-2 bg-white"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="text-sm font-bold">
          Tu email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
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
          "Inscribiendo..."
        ) : (
          <>
            <Gift className="size-4" aria-hidden="true" />
            Inscribirme
          </>
        )}
      </button>
    </form>
  );
}

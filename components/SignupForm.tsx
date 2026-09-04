"use client";

import { useActionState } from "react";
import { UserPlus } from "lucide-react";
import { signUpAction } from "@/lib/actions/auth";
import type { AuthFormState } from "@/lib/actions/auth";
import { PasswordInput } from "@/components/PasswordInput";

const initialState: AuthFormState = {};

interface SignupFormProps {
  /** Nombre de evento que el usuario ya había escrito antes de registrarse. */
  eventName?: string;
}

export function SignupForm({ eventName }: SignupFormProps = {}) {
  const [state, formAction, pending] = useActionState(signUpAction, initialState);

  return (
    <form action={formAction} className="nb-card p-6 flex flex-col gap-4 w-full">
      {eventName && <input type="hidden" name="eventName" value={eventName} />}
      <div className="flex flex-col gap-1">
        <label htmlFor="name" className="text-sm font-bold">
          Tu nombre
        </label>
        <input
          id="name"
          name="name"
          required
          placeholder="Tu nombre"
          className="border-2 border-border rounded-lg px-3 py-2 bg-white"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="text-sm font-bold">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          placeholder="tu@ejemplo.com"
          className="border-2 border-border rounded-lg px-3 py-2 bg-white"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="password" className="text-sm font-bold">
          Contraseña
        </label>
        <PasswordInput
          id="password"
          name="password"
          required
          minLength={6}
          placeholder="Al menos 6 caracteres"
        />
      </div>
      {state.error && <p className="text-accent font-bold text-sm">{state.error}</p>}
      {state.info && <p className="text-foreground font-bold text-sm">{state.info}</p>}
      <button
        type="submit"
        disabled={pending}
        className="nb-btn nb-btn-primary px-5 py-3 disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {pending ? (
          "Creando cuenta..."
        ) : (
          <>
            <UserPlus className="size-4" aria-hidden="true" />
            Crear cuenta
          </>
        )}
      </button>
    </form>
  );
}

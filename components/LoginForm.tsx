"use client";

import { useActionState } from "react";
import { LogIn } from "lucide-react";
import { signInAction } from "@/lib/actions/auth";
import type { AuthFormState } from "@/lib/actions/auth";

const initialState: AuthFormState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(signInAction, initialState);

  return (
    <form action={formAction} className="nb-card p-6 flex flex-col gap-4 w-full">
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
        <input
          id="password"
          name="password"
          type="password"
          required
          placeholder="••••••••"
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
          "Ingresando..."
        ) : (
          <>
            <LogIn className="size-4" aria-hidden="true" />
            Iniciar sesión
          </>
        )}
      </button>
    </form>
  );
}

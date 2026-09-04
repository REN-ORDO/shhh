"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createEventForUser } from "@/lib/actions/events";

export interface AuthFormState {
  error?: string;
  info?: string;
}

/** Inicia sesión con email + contraseña y redirige al dashboard. */
export async function signInAction(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Completa tu email y contraseña." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: "Email o contraseña incorrectos." };
  }

  redirect("/admin");
}

/** Crea una cuenta nueva para el organizador. */
export async function signUpAction(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!name || !email || !password) {
    return { error: "Completa todos los campos." };
  }

  if (password.length < 6) {
    return { error: "La contraseña debe tener al menos 6 caracteres." };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name } },
  });

  if (error) {
    return { error: "No se pudo crear la cuenta. Prueba con otro email." };
  }

  // Si la confirmación de email está activada en el proyecto Supabase, no hay
  // sesión todavía y hay que avisarle al usuario que revise su correo.
  if (!data.session) {
    return {
      info: "¡Cuenta creada! Revisa tu email para confirmar la cuenta antes de iniciar sesión.",
    };
  }

  // Si el usuario llegó acá desde "Crea tu evento" sin sesión, el nombre que
  // ya había escrito viaja como campo oculto — lo creamos de una para no
  // obligarlo a escribirlo de nuevo (y para que no crea que ya lo creó).
  const eventName = String(formData.get("eventName") ?? "").trim();
  if (eventName && data.user) {
    const result = await createEventForUser(data.user, eventName);
    if (result.error) {
      return { error: result.error };
    }
  }

  redirect("/admin");
}

/** Cierra la sesión del organizador y vuelve a la landing. */
export async function signOutAction(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/");
}

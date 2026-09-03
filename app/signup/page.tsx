import Link from "next/link";
import { Gift } from "lucide-react";
import { SignupForm } from "@/components/SignupForm";

export default function SignupPage() {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center px-6 py-12 gap-8">
      <Link href="/" className="text-lg font-extrabold flex items-center gap-2">
        <Gift className="size-5" aria-hidden="true" />
        Amigo Secreto
      </Link>

      <div className="flex flex-col items-center gap-6 w-full max-w-md">
        <div className="text-center flex flex-col gap-2">
          <span className="nb-pill self-center">Organizador/a</span>
          <h1 className="text-2xl font-extrabold">Crea tu cuenta</h1>
          <p className="text-muted text-sm">
            Así podés recuperar el acceso a tus eventos aunque pierdas el link.
          </p>
        </div>

        <SignupForm />

        <p className="text-sm text-muted">
          ¿Ya tenés cuenta?{" "}
          <Link href="/login" className="font-bold text-accent underline">
            Iniciá sesión
          </Link>
        </p>
      </div>
    </div>
  );
}

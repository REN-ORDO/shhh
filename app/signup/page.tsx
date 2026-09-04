import Link from "next/link";
import { ArrowLeft, Gift } from "lucide-react";
import { SignupForm } from "@/components/SignupForm";

export default function SignupPage() {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center px-6 py-12 gap-4">
      <Link href="/" className="text-lg font-extrabold flex items-center gap-2">
        <Gift className="size-5" aria-hidden="true" />
        Shhh
      </Link>

      <div className="flex flex-col items-center gap-6 w-full max-w-md">
        <Link
          href="/"
          className="self-start text-sm font-bold text-muted flex items-center gap-1 hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Volver al inicio
        </Link>

        <div className="text-center flex flex-col gap-2">
          <span className="nb-pill self-center">Organizador/a</span>
          <h1 className="text-2xl font-extrabold">Crea tu cuenta</h1>
          <p className="text-muted text-sm">
            Así puedes recuperar el acceso a tus eventos aunque pierdas el link.
          </p>
        </div>

        <SignupForm />

        <p className="text-sm text-muted">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="font-bold text-accent underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}

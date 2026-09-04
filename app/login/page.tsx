import Link from "next/link";
import { ArrowLeft, Gift } from "lucide-react";
import { LoginForm } from "@/components/LoginForm";

export default function LoginPage() {
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
          <h1 className="text-2xl font-extrabold">Inicia sesión</h1>
          <p className="text-muted text-sm">
            Accede a tus eventos aunque hayas perdido el link de administración.
          </p>
        </div>

        <LoginForm />

        <p className="text-sm text-muted">
          ¿No tienes cuenta?{" "}
          <Link href="/signup" className="font-bold text-accent underline">
            Crea una acá
          </Link>
        </p>
      </div>
    </div>
  );
}

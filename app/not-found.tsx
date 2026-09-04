import Link from "next/link";
import { Gift, SearchX, Home } from "lucide-react";
import { BackButton } from "@/components/BackButton";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-16 text-center">
      <span className="nb-pill">
        <Gift className="size-3.5" aria-hidden="true" />
        Shhh
      </span>

      <div className="nb-icon-circle w-20 h-20">
        <SearchX className="size-10" aria-hidden="true" />
      </div>

      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-extrabold">404</h1>
        <p className="text-lg font-bold">No encontramos esta página</p>
        <p className="text-muted max-w-sm">
          El link puede estar mal escrito, o el evento ya no existe. Revisa el
          link que te compartieron, o empieza de nuevo desde el inicio.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <BackButton />
        <Link
          href="/"
          className="nb-btn nb-btn-primary px-6 py-3 flex items-center gap-2"
        >
          <Home className="size-4" aria-hidden="true" />
          Ir al inicio
        </Link>
      </div>
    </div>
  );
}

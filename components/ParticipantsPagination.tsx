import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ParticipantsPaginationProps {
  adminToken: string;
  currentPage: number;
  totalPages: number;
}

/** Paginación simple por link (?page=N), sin JS de cliente. */
export function ParticipantsPagination({
  adminToken,
  currentPage,
  totalPages,
}: ParticipantsPaginationProps) {
  const prevPage = Math.max(1, currentPage - 1);
  const nextPage = Math.min(totalPages, currentPage + 1);

  return (
    <div className="flex items-center justify-between gap-3 pt-2 border-t-2 border-border/20">
      <Link
        href={`/admin/${adminToken}?page=${prevPage}`}
        aria-disabled={currentPage === 1}
        className={`nb-btn nb-btn-secondary px-3 py-2 text-sm flex items-center gap-1 ${
          currentPage === 1 ? "opacity-40 pointer-events-none" : ""
        }`}
      >
        <ChevronLeft className="size-4" aria-hidden="true" />
        Anterior
      </Link>

      <span className="text-sm text-muted font-bold">
        Página {currentPage} de {totalPages}
      </span>

      <Link
        href={`/admin/${adminToken}?page=${nextPage}`}
        aria-disabled={currentPage === totalPages}
        className={`nb-btn nb-btn-secondary px-3 py-2 text-sm flex items-center gap-1 ${
          currentPage === totalPages ? "opacity-40 pointer-events-none" : ""
        }`}
      >
        Siguiente
        <ChevronRight className="size-4" aria-hidden="true" />
      </Link>
    </div>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export function BackButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.back()}
      className="nb-btn nb-btn-secondary px-6 py-3 flex items-center gap-2"
    >
      <ArrowLeft className="size-4" aria-hidden="true" />
      Volver atrás
    </button>
  );
}

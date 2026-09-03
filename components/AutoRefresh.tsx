"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Polling simple: refresca los datos del panel admin cada N segundos. */
export function AutoRefresh({ intervalMs = 8000 }: { intervalMs?: number }) {
  const router = useRouter();

  useEffect(() => {
    const id = setInterval(() => router.refresh(), intervalMs);
    return () => clearInterval(id);
  }, [router, intervalMs]);

  return null;
}

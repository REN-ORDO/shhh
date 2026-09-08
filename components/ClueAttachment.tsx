"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";

/**
 * Miniatura de una imagen adjunta a una pista. Al hacer clic abre un
 * preview a pantalla completa (lightbox) con la misma imagen en tamaño
 * grande; se cierra con el botón, clic afuera, o Escape.
 */
export function ClueAttachment({ src, alt }: { src: string; alt: string }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="relative w-full aspect-video overflow-hidden rounded-md cursor-zoom-in"
        aria-label="Ver imagen en tamaño completo"
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(min-width: 640px) 576px, 100vw"
          className="object-cover"
        />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Vista previa de la imagen"
        >
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2 hover:bg-black/70 transition-colors"
            aria-label="Cerrar vista previa"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
          <div
            className="relative w-full h-full max-w-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={src}
              alt={alt}
              fill
              sizes="100vw"
              className="object-contain"
            />
          </div>
        </div>
      )}
    </>
  );
}

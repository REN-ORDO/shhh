"use client";

import { useEffect, useRef, type ReactNode } from "react";

interface ConfirmButtonProps {
  children: ReactNode;
  title: string;
  description: string;
  confirmLabel?: string;
  pending?: boolean;
  pendingLabel?: string;
  className: string;
}

/**
 * Botón que abre un modal de confirmación antes de disparar el submit del
 * <form> que lo contiene. Pensado para acciones sensibles (eliminar,
 * regenerar link, reemplazar) donde un click de más sería difícil de
 * deshacer.
 */
export function ConfirmButton({
  children,
  title,
  description,
  confirmLabel = "Confirmar",
  pending,
  pendingLabel,
  className,
}: ConfirmButtonProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Bloquea el scroll del fondo mientras el modal está abierto y lo
  // restaura al cerrarse, sin importar cómo se cierre (botón, Escape, etc.).
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const unlockScroll = () => {
      document.body.style.overflow = "";
    };

    dialog.addEventListener("close", unlockScroll);
    return () => {
      dialog.removeEventListener("close", unlockScroll);
      unlockScroll();
    };
  }, []);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        disabled={pending}
        onClick={() => {
          document.body.style.overflow = "hidden";
          dialogRef.current?.showModal();
        }}
        className={className}
      >
        {pending ? (pendingLabel ?? "...") : children}
      </button>

      <dialog
        ref={dialogRef}
        className="nb-card p-6 max-w-sm w-[90vw] m-0 fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 backdrop:bg-black/40"
      >
        <h3 className="font-extrabold text-lg mb-2">{title}</h3>
        <p className="text-sm text-muted mb-5">{description}</p>
        <div className="flex gap-3 justify-end">
          <button
            type="button"
            className="nb-btn nb-btn-secondary px-4 py-2 text-sm"
            onClick={() => {
              dialogRef.current?.close();
              document.body.style.overflow = "";
            }}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="nb-btn nb-btn-primary px-4 py-2 text-sm"
            onClick={() => {
              dialogRef.current?.close();
              document.body.style.overflow = "";
              buttonRef.current?.closest("form")?.requestSubmit();
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </dialog>
    </>
  );
}

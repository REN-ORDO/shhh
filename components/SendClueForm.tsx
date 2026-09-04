"use client";

import { useActionState, useRef, useState } from "react";
import { ImagePlus, MessageCircleHeart, X } from "lucide-react";
import { sendClueAction } from "@/lib/actions/clues";
import {
  MAX_ATTACH_BYTES,
  MAX_ATTACH_COUNT,
} from "@/lib/validate";
import type { FormState } from "@/lib/actions/events";

const initialState: FormState = {};

// Los MIME se filtran en el input de archivos, pero este set se usa para la
// vista previa (object URLs) y como guardia del lado del cliente.
const ALLOWED_IMAGE_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
]);

export function SendClueForm({ accessToken }: { accessToken: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [clientError, setClientError] = useState<string | null>(null);
  const [state, formAction, pending] = useActionState(async (
    prev: FormState,
    formData: FormData
  ) => {
    const result = await sendClueAction(prev, formData);
    if (!result.error) {
      formRef.current?.reset();
      setSelectedFiles([]);
      setClientError(null);
    }
    return result;
  }, initialState);

  function handleFilesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []).filter((f) =>
      ALLOWED_IMAGE_MIME.has(f.type)
    );
    setSelectedFiles(files);
    if (files.length > MAX_ATTACH_COUNT) {
      setClientError(`Podés adjuntar hasta ${MAX_ATTACH_COUNT} imágenes.`);
    } else if (files.some((f) => f.size > MAX_ATTACH_BYTES)) {
      setClientError("Cada imagen debe pesar menos de 5 MB.");
    } else {
      setClientError(null);
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    // Guardia del lado del cliente: bloquea el envío si la selección no pasa
    // los límites. La autoridad sigue siendo la validación del servidor.
    if (selectedFiles.length > MAX_ATTACH_COUNT) {
      e.preventDefault();
      setClientError(`Podés adjuntar hasta ${MAX_ATTACH_COUNT} imágenes.`);
      return;
    }
    if (selectedFiles.some((f) => f.size > MAX_ATTACH_BYTES)) {
      e.preventDefault();
      setClientError("Cada imagen debe pesar menos de 5 MB.");
      return;
    }
    if (selectedFiles.some((f) => !ALLOWED_IMAGE_MIME.has(f.type))) {
      e.preventDefault();
      setClientError("Solo se aceptan imágenes (JPG, PNG, GIF o WebP).");
      return;
    }
    setClientError(null);
  }

  function removeFile(index: number) {
    const next = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(next);
    setClientError(null);
    // Limpia el input para que el FormData no incluya el archivo removido.
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <form
      ref={formRef}
      action={formAction}
      onSubmit={handleSubmit}
      className="nb-card p-5 flex flex-col gap-3"
    >
      <input type="hidden" name="accessToken" value={accessToken} />
      <h3 className="font-extrabold flex items-center gap-2">
        <MessageCircleHeart className="size-4 text-accent" aria-hidden="true" />
        Mándale una pista anónima
      </h3>
      <p className="text-sm text-muted">
        Tu mensaje se envía sin tu nombre: la otra persona nunca sabrá que lo
        mandaste tú.
      </p>
      <textarea
        name="message"
        required
        maxLength={500}
        rows={3}
        placeholder="Ej: me gustan los libros de fantasía..."
        className="border-2 border-border rounded-lg px-3 py-2 bg-white resize-none"
      />

      <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer border-2 border-dashed border-border rounded-lg px-3 py-2 hover:bg-accent-light transition-colors">
        <ImagePlus className="size-4 text-accent" aria-hidden="true" />
        Agregar imágenes (opcional)
        <input
          ref={fileInputRef}
          type="file"
          name="attachments"
          accept="image/jpeg,image/png,image/gif,image/webp"
          multiple
          className="sr-only"
          onChange={handleFilesChange}
        />
      </label>

      {selectedFiles.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {selectedFiles.map((file, index) => (
            <li
              key={`${file.name}-${index}`}
              className="relative w-16 h-16 rounded-lg overflow-hidden border border-border group"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={URL.createObjectURL(file)}
                alt={`Vista previa de ${file.name}`}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="absolute top-0 right-0 bg-black/60 text-white rounded-bl-lg p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label={`Quitar ${file.name}`}
              >
                <X className="size-3" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {(clientError || state.error) && (
        <p className="text-accent font-bold text-sm">
          {clientError ?? state.error}
        </p>
      )}
      <button type="submit" disabled={pending} className="nb-btn nb-btn-primary px-5 py-2 self-start disabled:opacity-60">
        {pending ? "Enviando..." : "Enviar pista"}
      </button>
    </form>
  );
}

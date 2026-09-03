"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

interface CopyFieldProps {
  value: string;
  /** Clases extra para el texto, ej. centrado y tracking para el código corto. */
  codeClassName?: string;
}

/** Campo de solo lectura: tocar cualquier parte del contenedor copia su valor. */
export function CopyField({ value, codeClassName = "" }: CopyFieldProps) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      aria-label={copied ? "Copiado" : "Copiar"}
      className="w-full flex items-center gap-2 border-2 border-border rounded-lg pl-3 pr-3 py-2 bg-white hover:bg-accent-light transition-colors cursor-pointer text-left"
    >
      <code className={`flex-1 text-sm break-all ${codeClassName}`}>
        {value}
      </code>
      {copied ? (
        <Check className="size-4 shrink-0 text-accent" aria-hidden="true" />
      ) : (
        <Copy className="size-4 shrink-0 text-muted" aria-hidden="true" />
      )}
    </button>
  );
}

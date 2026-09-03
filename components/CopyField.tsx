"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

interface CopyFieldProps {
  value: string;
  /** Clases extra para el <code>, ej. centrado y tracking para el código corto. */
  codeClassName?: string;
}

/** Campo de solo lectura con botón para copiar su valor al portapapeles. */
export function CopyField({ value, codeClassName = "" }: CopyFieldProps) {
  const [copied, setCopied] = useState(false);

  return (
    <div className="relative">
      <code
        className={`block border-2 border-border rounded-lg pl-3 pr-11 py-2 bg-white text-sm break-all ${codeClassName}`}
      >
        {value}
      </code>
      <button
        type="button"
        onClick={async () => {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }}
        aria-label={copied ? "Copiado" : "Copiar"}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
      >
        {copied ? (
          <Check className="size-4" aria-hidden="true" />
        ) : (
          <Copy className="size-4" aria-hidden="true" />
        )}
      </button>
    </div>
  );
}

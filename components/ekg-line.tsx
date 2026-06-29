"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

/**
 * Línea de electrocardiograma (EKG) tomada del logo de WOLFF.
 * Se dibuja como un patrón que se repite horizontalmente y usa `currentColor`,
 * por lo que el color y la opacidad se controlan con clases de texto
 * (ej: `text-primary/30`). Pensado como acento sutil, no como decoración pesada.
 */
export function EkgLine({ className }: { className?: string }) {
  const id = useId().replace(/[:]/g, "");

  return (
    <svg
      aria-hidden="true"
      className={cn("block h-6 w-full", className)}
      preserveAspectRatio="none"
    >
      <defs>
        <pattern
          id={`ekg-${id}`}
          width="64"
          height="24"
          patternUnits="userSpaceOnUse"
        >
          {/* Una pulsación por mosaico; empieza y termina en la línea base (y=12)
              para que el patrón se repita sin cortes. */}
          <path
            d="M0 12 H16 l2 -2 l2 4 l2 -9 l3 16 l2 -9 l2 0 H64"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#ekg-${id})`} />
    </svg>
  );
}

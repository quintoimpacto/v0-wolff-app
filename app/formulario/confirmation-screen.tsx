"use client";

import { CheckCircle2 } from "lucide-react";
import { WolffLogo } from "@/components/wolff-logo";
import { EkgLine } from "@/components/ekg-line";

interface ConfirmationScreenProps {
  nombre: string;
}

/** Pantalla final de confirmación. No permite volver a editar el formulario. */
export function ConfirmationScreen({ nombre }: ConfirmationScreenProps) {
  const firstName = nombre.trim().split(/\s+/)[0] || nombre;

  return (
    <div className="flex min-h-dvh flex-col bg-secondary">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex w-full max-w-md items-center px-4 py-3">
          <WolffLogo width={120} height={87} className="h-10 w-auto" priority />
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-6 py-12 text-center">
        <span className="flex size-20 items-center justify-center rounded-full bg-primary/10 text-primary">
          <CheckCircle2 className="size-11" aria-hidden="true" />
        </span>

        <h1 className="mt-6 text-balance text-3xl font-bold leading-tight tracking-tight text-foreground">
          ¡Listo! El médico ya tiene tu información.
        </h1>

        <EkgLine className="my-6 h-5 w-48 text-primary/30" />

        <p className="text-pretty text-lg leading-relaxed text-muted-foreground">
          Gracias, <span className="font-semibold text-foreground">{firstName}</span>.
          Ya podés guardar el teléfono. Te van a llamar por tu nombre cuando sea tu
          turno en la consulta.
        </p>

        <p className="mt-8 text-sm leading-relaxed text-muted-foreground">
          Si necesitás corregir algún dato, avisale a la recepción.
        </p>
      </main>
    </div>
  );
}

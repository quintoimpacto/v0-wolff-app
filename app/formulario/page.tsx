"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, Minus, Plus } from "lucide-react";
import { WolffLogo } from "@/components/wolff-logo";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  PersonalDataStep,
  emptyPersonalData,
  isPersonalDataValid,
  type PersonalData,
} from "./personal-data-step";

const STEPS = [
  {
    title: "Datos personales",
    description: "Tu información básica de contacto e identificación.",
  },
  {
    title: "Actividad física",
    description: "El deporte que practicás y con qué frecuencia.",
  },
  {
    title: "Antecedentes médicos",
    description: "Tu historia clínica y la de tu familia.",
  },
  {
    title: "Hábitos y síntomas",
    description: "Hábitos diarios y cómo te sentís últimamente.",
  },
] as const;

// Font scale levels for the A- / A+ control.
const SCALES = [0.9, 1, 1.15, 1.3] as const;
const DEFAULT_SCALE_INDEX = 1;

export default function FormularioPage() {
  const [step, setStep] = useState(0);
  const [scaleIndex, setScaleIndex] = useState(DEFAULT_SCALE_INDEX);
  const [personal, setPersonal] = useState<PersonalData>(emptyPersonalData);

  const isLastStep = step === STEPS.length - 1;
  const progress = ((step + 1) / STEPS.length) * 100;
  const current = STEPS[step];
  const fontPx = 16 * SCALES[scaleIndex];

  // El paso 1 exige que los campos obligatorios estén completos antes de continuar.
  const canContinue = step === 0 ? isPersonalDataValid(personal) : true;

  function updatePersonal(patch: Partial<PersonalData>) {
    setPersonal((prev) => ({ ...prev, ...patch }));
  }

  function goNext() {
    if (!isLastStep && canContinue) setStep((s) => s + 1);
  }

  function goBack() {
    if (step > 0) setStep((s) => s - 1);
  }

  return (
    <div className="flex min-h-dvh flex-col bg-secondary">
      {/* Top bar with logo + font size controls (fixed at top) */}
      <header className="sticky top-0 z-10 border-b border-border bg-background">
        <div className="mx-auto flex w-full max-w-md items-center justify-between gap-3 px-4 py-3">
          <WolffLogo width={120} height={87} className="h-10 w-auto" priority />
          <div className="flex items-center gap-1" role="group" aria-label="Tamaño del texto">
            <Button
              variant="outline"
              size="icon"
              className="size-11 rounded-full"
              onClick={() => setScaleIndex((i) => Math.max(0, i - 1))}
              disabled={scaleIndex === 0}
              aria-label="Reducir tamaño del texto"
            >
              <Minus className="size-4" aria-hidden="true" />
            </Button>
            <span className="px-1 text-sm font-medium text-muted-foreground" aria-hidden="true">
              A
            </span>
            <Button
              variant="outline"
              size="icon"
              className="size-11 rounded-full"
              onClick={() => setScaleIndex((i) => Math.min(SCALES.length - 1, i + 1))}
              disabled={scaleIndex === SCALES.length - 1}
              aria-label="Aumentar tamaño del texto"
            >
              <Plus className="size-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 py-6">
        {/* Progress */}
        <section aria-label="Progreso del formulario" className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-sm font-medium text-muted-foreground">
            <span>
              Paso {step + 1} de {STEPS.length}
            </span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2.5" />
          <ol className="mt-1 flex items-center gap-1.5" aria-hidden="true">
            {STEPS.map((s, i) => (
              <li
                key={s.title}
                className={cn(
                  "h-1.5 flex-1 rounded-full transition-colors",
                  i <= step ? "bg-primary" : "bg-border",
                )}
              />
            ))}
          </ol>
        </section>

        {/* Step content — font size scales with the A-/A+ control */}
        <section
          className="mt-8 flex flex-1 flex-col"
          style={{ fontSize: `${fontPx}px` }}
        >
          <p className="text-[0.875em] font-semibold uppercase tracking-wide text-primary">
            Formulario del paciente
          </p>
          <h1 className="mt-2 text-balance text-[1.75em] font-semibold leading-tight text-foreground">
            {current.title}
          </h1>
          <p className="mt-3 text-pretty text-[1.0625em] leading-relaxed text-muted-foreground">
            {current.description}
          </p>

          {step === 0 ? (
            <PersonalDataStep value={personal} onChange={updatePersonal} />
          ) : (
            /* Placeholder for upcoming fields */
            <div className="mt-6 flex flex-1 items-center justify-center rounded-xl border border-dashed border-border bg-background/60 p-6 text-center">
              <p className="text-[1em] leading-relaxed text-muted-foreground">
                Los campos de esta sección se agregarán próximamente.
              </p>
            </div>
          )}
        </section>

        {/* Navigation */}
        <div className="mt-6 flex flex-col gap-3">
          <Button
            size="lg"
            className="h-14 w-full text-base"
            onClick={goNext}
            disabled={isLastStep || !canContinue}
          >
            {isLastStep ? (
              <>
                <Check className="size-5" data-icon="inline-start" aria-hidden="true" />
                Finalizar
              </>
            ) : (
              <>
                Continuar
                <ArrowRight className="size-5" data-icon="inline-end" aria-hidden="true" />
              </>
            )}
          </Button>

          {step > 0 ? (
            <Button
              variant="ghost"
              size="lg"
              className="h-12 w-full text-base text-muted-foreground"
              onClick={goBack}
            >
              <ArrowLeft className="size-5" data-icon="inline-start" aria-hidden="true" />
              Volver
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="lg"
              nativeButton={false}
              className="h-12 w-full text-base text-muted-foreground"
              render={<Link href="/">Salir</Link>}
            />
          )}
        </div>
      </main>
    </div>
  );
}

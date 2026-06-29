"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { WolffLogo } from "@/components/wolff-logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  PersonalDataStep,
  emptyPersonalData,
  isPersonalDataValid,
  type PersonalData,
} from "./personal-data-step";
import {
  ActivityStep,
  emptyActivityData,
  isActivityDataValid,
  type ActivityData,
} from "./activity-step";

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
  const [activity, setActivity] = useState<ActivityData>(emptyActivityData);

  const isLastStep = step === STEPS.length - 1;
  const progress = ((step + 1) / STEPS.length) * 100;
  const current = STEPS[step];
  const fontPx = 16 * SCALES[scaleIndex];

  // Cada paso exige que sus campos obligatorios estén completos antes de continuar.
  const canContinue =
    step === 0
      ? isPersonalDataValid(personal)
      : step === 1
        ? isActivityDataValid(activity)
        : true;

  function updatePersonal(patch: Partial<PersonalData>) {
    setPersonal((prev) => ({ ...prev, ...patch }));
  }

  function updateActivity(patch: Partial<ActivityData>) {
    setActivity((prev) => ({ ...prev, ...patch }));
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
          <div
            className="flex items-stretch overflow-hidden rounded-full border border-border"
            role="group"
            aria-label="Tamaño del texto"
          >
            <button
              type="button"
              onClick={() => setScaleIndex((i) => Math.max(0, i - 1))}
              disabled={scaleIndex === 0}
              aria-label="Reducir tamaño del texto"
              className="flex h-11 w-12 items-center justify-center font-semibold leading-none text-foreground transition-colors hover:bg-muted disabled:opacity-40"
            >
              <span className="text-xs" aria-hidden="true">A</span>
            </button>
            <span className="w-px self-stretch bg-border" aria-hidden="true" />
            <button
              type="button"
              onClick={() => setScaleIndex((i) => Math.min(SCALES.length - 1, i + 1))}
              disabled={scaleIndex === SCALES.length - 1}
              aria-label="Aumentar tamaño del texto"
              className="flex h-11 w-12 items-center justify-center font-bold leading-none text-foreground transition-colors hover:bg-muted disabled:opacity-40"
            >
              <span className="text-2xl" aria-hidden="true">A</span>
            </button>
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
          <ol className="flex items-center gap-1.5" aria-hidden="true">
            {STEPS.map((s, i) => (
              <li
                key={s.title}
                className={cn(
                  "h-2 flex-1 rounded-full transition-colors",
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
          <p className="text-[0.8125em] font-semibold uppercase tracking-[0.12em] text-primary">
            Formulario del paciente
          </p>
          <h1 className="mt-1.5 text-balance text-[2.125em] font-bold leading-[1.1] tracking-tight text-foreground">
            {current.title}
          </h1>
          <p className="mt-2 text-pretty text-[0.9375em] leading-relaxed text-muted-foreground">
            {current.description}
          </p>

          {step === 0 ? (
            <PersonalDataStep value={personal} onChange={updatePersonal} />
          ) : step === 1 ? (
            <ActivityStep value={activity} onChange={updateActivity} />
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

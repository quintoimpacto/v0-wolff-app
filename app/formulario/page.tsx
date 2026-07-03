"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, Loader2, AlertCircle } from "lucide-react";
import { WolffLogo } from "@/components/wolff-logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { guardarPaciente } from "./actions";
import {
  PersonalDataStep,
  emptyPersonalData,
  isPersonalDataValid,
  calculateAge,
  type PersonalData,
} from "./personal-data-step";
import {
  ActivityStep,
  emptyActivityData,
  isActivityDataValid,
  type ActivityData,
} from "./activity-step";
import {
  MedicalStep,
  emptyMedicalData,
  isMedicalDataValid,
  type MedicalData,
} from "./medical-step";
import {
  HabitsStep,
  emptyHabitsData,
  isHabitsDataValid,
  type HabitsData,
} from "./habits-step";

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
  const [medical, setMedical] = useState<MedicalData>(emptyMedicalData);
  const [habits, setHabits] = useState<HabitsData>(emptyHabitsData);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  // Cuando el guardado es exitoso guardamos el nombre para la pantalla final.
  const [submittedName, setSubmittedName] = useState<string | null>(null);

  // Al cambiar de paso, subimos la pantalla para mostrar siempre la primera pregunta.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [step]);

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
        : step === 2
          ? isMedicalDataValid(medical)
          : isHabitsDataValid(habits);

  function updatePersonal(patch: Partial<PersonalData>) {
    setPersonal((prev) => ({ ...prev, ...patch }));
  }

  function updateActivity(patch: Partial<ActivityData>) {
    setActivity((prev) => ({ ...prev, ...patch }));
  }

  function updateMedical(patch: Partial<MedicalData>) {
    setMedical((prev) => ({ ...prev, ...patch }));
  }

  function updateHabits(patch: Partial<HabitsData>) {
    setHabits((prev) => ({ ...prev, ...patch }));
  }

  async function handleSubmit() {
    setSubmitError(null);
    setSubmitting(true);

    // Fecha de nacimiento en ISO (YYYY-MM-DD) y edad calculada.
    const pad = (v: string) => v.padStart(2, "0");
    const birthDate =
      personal.day && personal.month && personal.year
        ? `${personal.year}-${pad(personal.month)}-${pad(personal.day)}`
        : null;
    const edad = calculateAge(personal.day, personal.month, personal.year);

    const result = await guardarPaciente({
      fullName: personal.fullName,
      dni: personal.dni,
      birthDate,
      edad,
      datos: {
        personal: { ...personal },
        activity: { ...activity },
        medical: { ...medical },
        habits: { ...habits },
      },
    });

    setSubmitting(false);

    if (result.ok) {
      setSubmittedName(personal.fullName.trim());
    } else {
      setSubmitError(result.error);
    }
  }

  function goNext() {
    if (!canContinue || submitting) return;
    if (isLastStep) {
      void handleSubmit();
      return;
    }
    setStep((s) => s + 1);
  }

  function goBack() {
    if (step > 0) setStep((s) => s - 1);
  }

  // Pantalla de confirmación: el formulario ya no se puede editar.
  if (submittedName) {
    return (
      <div className="flex min-h-dvh flex-col bg-secondary">
        <header className="sticky top-0 z-10 border-b border-border bg-background">
          <div className="mx-auto flex w-full max-w-md items-center justify-between gap-3 px-4 py-3">
            <WolffLogo width={120} height={87} className="h-10 w-auto" priority />
          </div>
        </header>
        <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-4 py-10 text-center">
          <span className="flex size-20 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Check className="size-10" aria-hidden="true" />
          </span>
          <h1 className="mt-6 text-balance text-3xl font-bold leading-tight tracking-tight text-foreground">
            ¡Listo! El médico ya tiene tu información.
          </h1>
          <p className="mt-3 text-pretty text-base leading-relaxed text-muted-foreground">
            Gracias, <span className="font-semibold text-foreground">{submittedName}</span>. Ya podés
            esperar a que te llamen a la consulta.
          </p>
          <Button
            variant="outline"
            size="lg"
            nativeButton={false}
            className="mt-8 h-12 w-full max-w-xs text-base"
            render={<Link href="/">Volver al inicio</Link>}
          />
        </main>
      </div>
    );
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
          ) : step === 2 ? (
            <MedicalStep value={medical} onChange={updateMedical} />
          ) : (
            <HabitsStep value={habits} onChange={updateHabits} />
          )}
        </section>

        {/* Navigation */}
        <div className="mt-6 flex flex-col gap-3">
          {submitError ? (
            <div
              role="alert"
              className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-left"
            >
              <AlertCircle className="mt-0.5 size-5 shrink-0 text-destructive" aria-hidden="true" />
              <div className="flex flex-col gap-0.5">
                <p className="text-sm font-semibold text-foreground">
                  No pudimos guardar tus datos
                </p>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {submitError} Tus respuestas siguen guardadas: tocá &quot;Reintentar&quot; para
                  volver a enviarlas.
                </p>
              </div>
            </div>
          ) : null}
          <Button
            size="lg"
            className="h-14 w-full text-base"
            onClick={goNext}
            disabled={!canContinue || submitting}
          >
            {isLastStep ? (
              submitting ? (
                <>
                  <Loader2 className="size-5 animate-spin" data-icon="inline-start" aria-hidden="true" />
                  Guardando...
                </>
              ) : submitError ? (
                <>
                  <Check className="size-5" data-icon="inline-start" aria-hidden="true" />
                  Reintentar
                </>
              ) : (
                <>
                  <Check className="size-5" data-icon="inline-start" aria-hidden="true" />
                  Finalizar
                </>
              )
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

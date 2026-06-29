"use client";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export type PracticaDeporte = "" | "si" | "no";
export type HorasSemana = "" | "menos_3" | "3_a_6" | "mas_6";
export type HaceCuanto = "" | "1_anio" | "2_a_5" | "mas_5";

export interface ActivityData {
  practica: PracticaDeporte;
  horasSemana: HorasSemana;
  haceCuanto: HaceCuanto;
  /** Edad desde la que practica deporte */
  edadInicio: string;
}

export const emptyActivityData: ActivityData = {
  practica: "",
  horasSemana: "",
  haceCuanto: "",
  edadInicio: "",
};

const PRACTICA_OPTIONS: { value: Exclude<PracticaDeporte, "">; label: string }[] = [
  { value: "si", label: "Sí" },
  { value: "no", label: "No" },
];

const HORAS_OPTIONS: { value: Exclude<HorasSemana, "">; label: string }[] = [
  { value: "menos_3", label: "Menos de 3" },
  { value: "3_a_6", label: "De 3 a 6" },
  { value: "mas_6", label: "Más de 6 horas" },
];

const HACE_CUANTO_OPTIONS: { value: Exclude<HaceCuanto, "">; label: string }[] = [
  { value: "1_anio", label: "1 año" },
  { value: "2_a_5", label: "2 a 5 años" },
  { value: "mas_5", label: "Más de 5 años" },
];

const inputClass =
  "h-auto w-full rounded-xl border border-border bg-background px-4 py-3.5 text-[1em] leading-snug text-foreground outline-none transition-colors placeholder:text-muted-foreground/70 hover:border-input focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/25";

// Misma fila seleccionable con radio que usa "Sexo" en el paso 1.
const radioRowClass =
  "flex cursor-pointer items-center gap-3 rounded-xl border border-input bg-background p-3.5 transition-colors has-data-checked:border-primary";

/** Indica si los campos obligatorios del paso están completos. */
export function isActivityDataValid(data: ActivityData): boolean {
  if (data.practica === "no") return true;
  if (data.practica === "si") {
    return (
      data.horasSemana !== "" &&
      data.haceCuanto !== "" &&
      data.edadInicio.trim().length > 0
    );
  }
  return false;
}

interface ActivityStepProps {
  value: ActivityData;
  onChange: (patch: Partial<ActivityData>) => void;
}

export function ActivityStep({ value, onChange }: ActivityStepProps) {
  const practiceYes = value.practica === "si";

  return (
    <div className="mt-6 flex flex-col gap-6">
      {/* ¿Hacés ejercicio o practicás deporte? */}
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-[1em] font-medium text-foreground">
          ¿Hacés ejercicio o practicás algún deporte? <span className="text-primary">*</span>
        </legend>
        <RadioGroup
          value={value.practica}
          onValueChange={(v) =>
            onChange(
              v === "no"
                ? // Al elegir "No" limpiamos los campos condicionales.
                  { practica: v as PracticaDeporte, horasSemana: "", haceCuanto: "", edadInicio: "" }
                : { practica: v as PracticaDeporte },
            )
          }
          className="gap-2.5"
        >
          {PRACTICA_OPTIONS.map((option) => (
            <label key={option.value} className={radioRowClass}>
              <RadioGroupItem value={option.value} className="size-[1.25em]" />
              <span className="text-[1em] text-foreground">{option.label}</span>
            </label>
          ))}
        </RadioGroup>
      </fieldset>

      {/* Campos condicionales — aparición suave cuando se elige "Sí" */}
      <div
        className={
          "grid transition-all duration-300 ease-out " +
          (practiceYes
            ? "grid-rows-[1fr] opacity-100"
            : "grid-rows-[0fr] opacity-0")
        }
      >
        <div className="overflow-hidden">
          <div className="flex flex-col gap-6">
            {/* ¿Cuántas horas por semana? */}
            <fieldset className="flex flex-col gap-2">
              <legend className="mb-2 text-[1em] font-medium text-foreground">
                ¿Cuántas horas por semana? <span className="text-primary">*</span>
              </legend>
              <RadioGroup
                value={value.horasSemana}
                onValueChange={(v) => onChange({ horasSemana: v as HorasSemana })}
                className="gap-2.5"
                disabled={!practiceYes}
              >
                {HORAS_OPTIONS.map((option) => (
                  <label key={option.value} className={radioRowClass}>
                    <RadioGroupItem value={option.value} className="size-[1.25em]" />
                    <span className="text-[1em] text-foreground">{option.label}</span>
                  </label>
                ))}
              </RadioGroup>
            </fieldset>

            {/* ¿Hace cuánto tiempo realizás esa cantidad? */}
            <fieldset className="flex flex-col gap-2">
              <legend className="mb-2 text-[1em] font-medium text-foreground">
                ¿Hace cuánto tiempo realizás esa cantidad? <span className="text-primary">*</span>
              </legend>
              <RadioGroup
                value={value.haceCuanto}
                onValueChange={(v) => onChange({ haceCuanto: v as HaceCuanto })}
                className="gap-2.5"
                disabled={!practiceYes}
              >
                {HACE_CUANTO_OPTIONS.map((option) => (
                  <label key={option.value} className={radioRowClass}>
                    <RadioGroupItem value={option.value} className="size-[1.25em]" />
                    <span className="text-[1em] text-foreground">{option.label}</span>
                  </label>
                ))}
              </RadioGroup>
            </fieldset>

            {/* ¿Desde qué edad practicás deporte? */}
            <div className="flex flex-col gap-2">
              <label htmlFor="edad-inicio" className="text-[1em] font-medium text-foreground">
                ¿Desde qué edad practicás deporte? <span className="text-primary">*</span>
              </label>
              <input
                id="edad-inicio"
                name="edad-inicio"
                type="text"
                inputMode="numeric"
                maxLength={3}
                value={value.edadInicio}
                onChange={(e) =>
                  onChange({ edadInicio: e.target.value.replace(/\D/g, "").slice(0, 3) })
                }
                className={inputClass}
                placeholder="Ej: 15"
                disabled={!practiceYes}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

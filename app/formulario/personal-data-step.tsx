"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export type Sexo = "" | "masculino" | "femenino" | "prefiero_no_decir";

export interface PersonalData {
  fullName: string;
  dni: string;
  /** Día del mes, "1".."31" */
  day: string;
  /** Mes, "1".."12" */
  month: string;
  /** Año de 4 cifras, ej "1958" */
  year: string;
  /** Peso en kg */
  weight: string;
  /** Altura en cm */
  height: string;
  sexo: Sexo;
}

export const emptyPersonalData: PersonalData = {
  fullName: "",
  dni: "",
  day: "",
  month: "",
  year: "",
  weight: "",
  height: "",
  sexo: "",
};

const MONTHS = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
] as const;

// Mapeo valor -> nombre del mes para que el Select muestre el nombre, no el número.
const MONTH_ITEMS = MONTHS.map((label, i) => ({ value: String(i + 1), label }));

const SEX_OPTIONS: { value: Exclude<Sexo, "">; label: string }[] = [
  { value: "masculino", label: "Masculino" },
  { value: "femenino", label: "Femenino" },
  { value: "prefiero_no_decir", label: "Prefiero no decir" },
];

const CURRENT_YEAR = new Date().getFullYear();
const MIN_YEAR = CURRENT_YEAR - 100;

/** Valida que día/mes/año formen una fecha real y dentro de un rango razonable. */
export function isValidBirthDate(day: string, month: string, year: string): boolean {
  if (!/^\d{4}$/.test(year)) return false;
  const d = Number(day);
  const m = Number(month);
  const y = Number(year);
  if (!d || !m || !y) return false;
  if (y < MIN_YEAR || y > CURRENT_YEAR) return false;
  const dt = new Date(y, m - 1, d);
  return dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d;
}

/** Calcula la edad en años a partir de la fecha de nacimiento. */
export function calculateAge(day: string, month: string, year: string): number | null {
  if (!isValidBirthDate(day, month, year)) return null;
  const birth = new Date(Number(year), Number(month) - 1, Number(day));
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

/** Indica si los campos obligatorios del paso están completos y válidos. */
export function isPersonalDataValid(data: PersonalData): boolean {
  return (
    data.fullName.trim().length > 0 &&
    data.dni.trim().length > 0 &&
    isValidBirthDate(data.day, data.month, data.year)
  );
}

const inputClass =
  "h-auto w-full rounded-xl border border-border bg-background px-4 py-3.5 text-[1em] leading-snug text-foreground outline-none transition-colors placeholder:text-muted-foreground/70 hover:border-input focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/25";

const selectTriggerClass =
  "w-full justify-between rounded-xl border-border px-4 py-3.5 text-[1em] data-[size=default]:h-auto";

// Resaltado de la opción: fondo de marca SÓLIDO con texto blanco para contraste legible.
// `**:text-*` reescribe el color del texto hijo, que la clase base fuerza al resaltar.
const selectItemClass =
  "rounded-lg py-2.5 text-[1em] text-foreground focus:bg-primary focus:text-primary-foreground focus:**:text-primary-foreground data-highlighted:bg-primary data-highlighted:text-primary-foreground data-highlighted:**:text-primary-foreground data-selected:bg-primary data-selected:text-primary-foreground data-selected:**:text-primary-foreground";

interface PersonalDataStepProps {
  value: PersonalData;
  onChange: (patch: Partial<PersonalData>) => void;
}

export function PersonalDataStep({ value, onChange }: PersonalDataStepProps) {
  // Determina el último día válido para el día (no limitamos dinámicamente, validamos al completar).
  const dayHasError = value.day !== "" && value.year !== "" && value.month !== "" && !isValidBirthDate(value.day, value.month, value.year);
  const age = calculateAge(value.day, value.month, value.year);

  return (
    <div className="mt-6 flex flex-col gap-6">
      {/* Nombre y apellido */}
      <div className="flex flex-col gap-2">
        <label htmlFor="fullName" className="text-[1em] font-medium text-foreground">
          Nombre y apellido <span className="text-primary">*</span>
        </label>
        <input
          id="fullName"
          name="fullName"
          type="text"
          autoComplete="name"
          required
          value={value.fullName}
          onChange={(e) => onChange({ fullName: e.target.value })}
          className={inputClass}
          placeholder="Ej: María González"
        />
      </div>

      {/* DNI */}
      <div className="flex flex-col gap-2">
        <label htmlFor="dni" className="text-[1em] font-medium text-foreground">
          DNI <span className="text-primary">*</span>
        </label>
        <input
          id="dni"
          name="dni"
          type="text"
          inputMode="numeric"
          autoComplete="off"
          required
          value={value.dni}
          onChange={(e) => onChange({ dni: e.target.value.replace(/\D/g, "") })}
          className={inputClass}
          placeholder="Ej: 12345678"
        />
        <p className="text-[0.8125em] leading-relaxed text-muted-foreground">
          Lo usamos para identificarte cuando te llamen a la consulta.
        </p>
      </div>

      {/* Fecha de nacimiento */}
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-[1em] font-medium text-foreground">
          Fecha de nacimiento <span className="text-primary">*</span>
        </legend>
        <div className="flex gap-2">
          {/* Día */}
          <div className="flex flex-1 flex-col gap-1.5">
            <label htmlFor="birth-day" className="text-[0.8125em] text-muted-foreground">
              Día
            </label>
            <Select
              value={value.day}
              onValueChange={(v) => onChange({ day: v as string })}
            >
              <SelectTrigger id="birth-day" className={selectTriggerClass} aria-label="Día">
                <SelectValue placeholder="Día" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 31 }, (_, i) => String(i + 1)).map((d) => (
                  <SelectItem key={d} value={d} className={selectItemClass}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Mes */}
          <div className="flex flex-[1.5] flex-col gap-1.5">
            <label htmlFor="birth-month" className="text-[0.8125em] text-muted-foreground">
              Mes
            </label>
            <Select
              items={MONTH_ITEMS}
              value={value.month}
              onValueChange={(v) => onChange({ month: v as string })}
            >
              <SelectTrigger id="birth-month" className={selectTriggerClass} aria-label="Mes">
                <SelectValue placeholder="Mes" />
              </SelectTrigger>
              <SelectContent>
                {MONTHS.map((name, i) => (
                  <SelectItem key={name} value={String(i + 1)} className={selectItemClass}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Año */}
          <div className="flex flex-1 flex-col gap-1.5">
            <label htmlFor="birth-year" className="text-[0.8125em] text-muted-foreground">
              Año
            </label>
            <input
              id="birth-year"
              name="birth-year"
              type="text"
              inputMode="numeric"
              maxLength={4}
              value={value.year}
              onChange={(e) => onChange({ year: e.target.value.replace(/\D/g, "").slice(0, 4) })}
              className={inputClass}
              placeholder="1958"
              aria-label="Año"
            />
          </div>
        </div>
        {dayHasError ? (
          <p className="text-[0.875em] leading-relaxed text-destructive">
            La fecha ingresada no es válida. Revisá el día, el mes y el año.
          </p>
        ) : age !== null ? (
          <p className="text-[0.875em] leading-relaxed text-muted-foreground">
            Edad: <span className="font-medium text-foreground">{age} años</span>
          </p>
        ) : null}
      </fieldset>

      {/* Peso y altura */}
      <div className="flex gap-3">
        <div className="flex flex-1 flex-col gap-2">
          <label htmlFor="weight" className="text-[1em] font-medium text-foreground">
            Peso (kg)
          </label>
          <input
            id="weight"
            name="weight"
            type="text"
            inputMode="decimal"
            value={value.weight}
            onChange={(e) => onChange({ weight: e.target.value.replace(/[^\d.,]/g, "") })}
            className={inputClass}
            placeholder="Ej: 72"
          />
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <label htmlFor="height" className="text-[1em] font-medium text-foreground">
            Altura (cm)
          </label>
          <input
            id="height"
            name="height"
            type="text"
            inputMode="numeric"
            value={value.height}
            onChange={(e) => onChange({ height: e.target.value.replace(/\D/g, "") })}
            className={inputClass}
            placeholder="Ej: 168"
          />
        </div>
      </div>

      {/* Sexo */}
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-[1em] font-medium text-foreground">Sexo</legend>
        <RadioGroup
          value={value.sexo}
          onValueChange={(v) => onChange({ sexo: v as Sexo })}
          className="gap-2.5"
        >
          {SEX_OPTIONS.map((option) => (
            <label
              key={option.value}
              className="flex cursor-pointer items-center gap-3 rounded-xl border border-input bg-background p-3.5 transition-colors has-data-checked:border-primary has-data-checked:bg-primary/5"
            >
              <RadioGroupItem value={option.value} className="size-[1.25em]" />
              <span className="text-[1em] text-foreground">{option.label}</span>
            </label>
          ))}
        </RadioGroup>
      </fieldset>
    </div>
  );
}

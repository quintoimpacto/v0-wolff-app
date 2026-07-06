"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export type SiNo = "" | "si" | "no";
export type Fuma = "" | "no" | "si" | "ex";
export type Alimentacion =
  | ""
  | "sin_restricciones"
  | "vegetariana"
  | "vegana"
  | "baja_sodio"
  | "baja_grasas"
  | "otra";

export interface HabitsData {
  fuma: Fuma;
  /** Fumador actual */
  cigarrillosDia: string;
  edadInicioFuma: string;
  /** Ex fumador */
  exCigarrillosDia: string;
  exEdadInicio: string;
  exAniosDejo: string;
  /** Alimentación (opcional) */
  alimentacion: Alimentacion;
  /** Síntomas */
  desmayos: SiNo;
  dolorPecho: SiNo;
  palpitaciones: SiNo;
}

export const emptyHabitsData: HabitsData = {
  fuma: "",
  cigarrillosDia: "",
  edadInicioFuma: "",
  exCigarrillosDia: "",
  exEdadInicio: "",
  exAniosDejo: "",
  alimentacion: "",
  desmayos: "",
  dolorPecho: "",
  palpitaciones: "",
};

const FUMA_OPTIONS: { value: Exclude<Fuma, "">; label: string }[] = [
  { value: "no", label: "No" },
  { value: "si", label: "Sí" },
  { value: "ex", label: "Antes fumaba, dejé" },
];

const SI_NO_OPTIONS: { value: Exclude<SiNo, "">; label: string }[] = [
  { value: "si", label: "Sí" },
  { value: "no", label: "No" },
];

const ALIMENTACION_ITEMS: { value: Exclude<Alimentacion, "">; label: string }[] = [
  { value: "sin_restricciones", label: "Sin restricciones" },
  { value: "vegetariana", label: "Vegetariana" },
  { value: "vegana", label: "Vegana" },
  { value: "baja_sodio", label: "Baja en sodio" },
  { value: "baja_grasas", label: "Baja en grasas" },
  { value: "otra", label: "Otra" },
];

const inputClass =
  "h-auto w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-[1em] leading-snug text-foreground outline-none transition-colors placeholder:text-muted-foreground/70 hover:border-[#cccccc] focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/20";

const selectTriggerClass =
  "w-full justify-between rounded-lg border-input px-3.5 py-2.5 text-[1em] font-medium text-foreground data-[size=default]:h-auto data-placeholder:font-normal data-placeholder:text-muted-foreground [&>svg]:text-foreground/60";

// Resaltado de la opción: fondo de marca SÓLIDO con texto blanco (mismo patrón que paso 1).
const selectItemClass =
  "rounded-lg py-2.5 text-[1em] text-foreground focus:bg-primary focus:text-primary-foreground focus:**:text-primary-foreground data-highlighted:bg-primary data-highlighted:text-primary-foreground data-highlighted:**:text-primary-foreground data-selected:bg-primary data-selected:text-primary-foreground data-selected:**:text-primary-foreground";

// Misma fila seleccionable con radio que usan los pasos anteriores.
const radioRowClass =
  "flex cursor-pointer items-center gap-3 border-b border-border py-3 text-foreground transition-colors last:border-b-0 has-data-checked:text-primary";

/** Indica si los campos obligatorios del paso están completos. */
export function isHabitsDataValid(data: HabitsData): boolean {
  let fumaOk = false;
  if (data.fuma === "no") {
    fumaOk = true;
  } else if (data.fuma === "si") {
    fumaOk =
      data.cigarrillosDia.trim().length > 0 && data.edadInicioFuma.trim().length > 0;
  } else if (data.fuma === "ex") {
    fumaOk =
      data.exCigarrillosDia.trim().length > 0 &&
      data.exEdadInicio.trim().length > 0 &&
      data.exAniosDejo.trim().length > 0;
  }

  const sintomasOk =
    data.desmayos !== "" && data.dolorPecho !== "" && data.palpitaciones !== "";

  return fumaOk && sintomasOk;
}

interface HabitsStepProps {
  value: HabitsData;
  onChange: (patch: Partial<HabitsData>) => void;
}

/** Bloque condicional con aparición suave. */
function Collapsible({ open, children }: { open: boolean; children: React.ReactNode }) {
  return (
    <div
      className={
        "grid transition-all duration-300 ease-out " +
        (open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0")
      }
    >
      <div className="overflow-hidden">
        <div className="flex flex-col gap-6 pt-2">{children}</div>
      </div>
    </div>
  );
}

/** Pregunta Sí/No reutilizable con el mismo estilo de filas con radio. */
function SiNoQuestion({
  legend,
  value,
  onValueChange,
}: {
  legend: string;
  value: SiNo;
  onValueChange: (v: SiNo) => void;
}) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-2 text-[1em] font-medium text-foreground">
        {legend} <span className="text-primary">*</span>
      </legend>
      <RadioGroup
        value={value}
        onValueChange={(v) => onValueChange(v as SiNo)}
        className="gap-0"
      >
        {SI_NO_OPTIONS.map((option) => (
          <label key={option.value} className={radioRowClass}>
            <RadioGroupItem value={option.value} className="size-[1.25em]" />
            <span className="text-[1em] text-foreground">{option.label}</span>
          </label>
        ))}
      </RadioGroup>
    </fieldset>
  );
}

/** Campo numérico reutilizable. */
function NumberField({
  id,
  label,
  value,
  disabled,
  placeholder,
  maxLength = 3,
  onValueChange,
}: {
  id: string;
  label: string;
  value: string;
  disabled?: boolean;
  placeholder?: string;
  maxLength?: number;
  onValueChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-[1em] font-medium text-foreground">
        {label} <span className="text-primary">*</span>
      </label>
      <input
        id={id}
        name={id}
        type="text"
        inputMode="numeric"
        maxLength={maxLength}
        value={value}
        onChange={(e) =>
          onValueChange(e.target.value.replace(/\D/g, "").slice(0, maxLength))
        }
        className={inputClass}
        placeholder={placeholder}
        disabled={disabled}
      />
    </div>
  );
}

export function HabitsStep({ value, onChange }: HabitsStepProps) {
  const fumaActual = value.fuma === "si";
  const exFumador = value.fuma === "ex";

  return (
    <div className="mt-8 flex flex-col gap-6">
      {/* Tabaquismo */}
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-[1em] font-medium text-foreground">
          ¿Fumás? <span className="text-primary">*</span>
        </legend>
        <RadioGroup
          value={value.fuma}
          onValueChange={(v) =>
            onChange(
              // Al cambiar, limpiamos los campos condicionales de la rama no elegida.
              v === "si"
                ? {
                    fuma: v as Fuma,
                    exCigarrillosDia: "",
                    exEdadInicio: "",
                    exAniosDejo: "",
                  }
                : v === "ex"
                  ? { fuma: v as Fuma, cigarrillosDia: "", edadInicioFuma: "" }
                  : {
                      fuma: v as Fuma,
                      cigarrillosDia: "",
                      edadInicioFuma: "",
                      exCigarrillosDia: "",
                      exEdadInicio: "",
                      exAniosDejo: "",
                    },
            )
          }
          className="gap-0"
        >
          {FUMA_OPTIONS.map((option) => (
            <label key={option.value} className={radioRowClass}>
              <RadioGroupItem value={option.value} className="size-[1.25em]" />
              <span className="text-[1em] text-foreground">{option.label}</span>
            </label>
          ))}
        </RadioGroup>
      </fieldset>

      {/* Fumador actual */}
      <Collapsible open={fumaActual}>
        <NumberField
          id="cigarrillos-dia"
          label="¿Cuántos cigarrillos por día?"
          value={value.cigarrillosDia}
          disabled={!fumaActual}
          placeholder="Ej: 10"
          onValueChange={(v) => onChange({ cigarrillosDia: v })}
        />
        <NumberField
          id="edad-inicio-fuma"
          label="¿Desde qué edad fumás?"
          value={value.edadInicioFuma}
          disabled={!fumaActual}
          placeholder="Ej: 18"
          onValueChange={(v) => onChange({ edadInicioFuma: v })}
        />
      </Collapsible>

      {/* Ex fumador */}
      <Collapsible open={exFumador}>
        <NumberField
          id="ex-cigarrillos-dia"
          label="¿Cuántos cigarrillos por día fumaba?"
          value={value.exCigarrillosDia}
          disabled={!exFumador}
          placeholder="Ej: 10"
          onValueChange={(v) => onChange({ exCigarrillosDia: v })}
        />
        <NumberField
          id="ex-edad-inicio"
          label="¿Desde qué edad fumaba?"
          value={value.exEdadInicio}
          disabled={!exFumador}
          placeholder="Ej: 18"
          onValueChange={(v) => onChange({ exEdadInicio: v })}
        />
        <NumberField
          id="ex-anios-dejo"
          label="¿Hace cuántos años dejó de fumar?"
          value={value.exAniosDejo}
          disabled={!exFumador}
          placeholder="Ej: 3"
          onValueChange={(v) => onChange({ exAniosDejo: v })}
        />
      </Collapsible>

      {/* Alimentación (opcional) */}
      <div className="flex flex-col gap-2">
        <label htmlFor="alimentacion" className="text-[1em] font-medium text-foreground">
          ¿Qué tipo de alimentación realizás?
        </label>
        <Select
          items={ALIMENTACION_ITEMS}
          value={value.alimentacion}
          onValueChange={(v) => onChange({ alimentacion: v as Alimentacion })}
        >
          <SelectTrigger
            id="alimentacion"
            className={selectTriggerClass}
            aria-label="Tipo de alimentación"
          >
            <SelectValue placeholder="Elegí una opción" />
          </SelectTrigger>
          <SelectContent>
            {ALIMENTACION_ITEMS.map((option) => (
              <SelectItem key={option.value} value={option.value} className={selectItemClass}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Síntomas */}
      <div className="flex flex-col gap-6 border-t border-border pt-6">
        <h2 className="text-[1.25em] font-bold tracking-tight text-foreground">
          ¿Alguna vez tuviste...?
        </h2>
        <SiNoQuestion
          legend="Desmayos"
          value={value.desmayos}
          onValueChange={(v) => onChange({ desmayos: v })}
        />
        <SiNoQuestion
          legend="Dolor de pecho"
          value={value.dolorPecho}
          onValueChange={(v) => onChange({ dolorPecho: v })}
        />
        <SiNoQuestion
          legend="Palpitaciones"
          value={value.palpitaciones}
          onValueChange={(v) => onChange({ palpitaciones: v })}
        />
      </div>
    </div>
  );
}

"use client";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export type SiNo = "" | "si" | "no";

export interface MedicalData {
  hipertenso: SiNo;
  hipertensoAnios: string;
  diabetico: SiNo;
  diabeticoAnios: string;
  usaInsulina: SiNo;
  colesterol: SiNo;
  colesterolMedicacion: SiNo;
  /** Año del último análisis de sangre (opcional) */
  anioAnalisis: string;
}

export const emptyMedicalData: MedicalData = {
  hipertenso: "",
  hipertensoAnios: "",
  diabetico: "",
  diabeticoAnios: "",
  usaInsulina: "",
  colesterol: "",
  colesterolMedicacion: "",
  anioAnalisis: "",
};

const SI_NO_OPTIONS: { value: Exclude<SiNo, "">; label: string }[] = [
  { value: "si", label: "Sí" },
  { value: "no", label: "No" },
];

const inputClass =
  "h-auto w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-[1em] leading-snug text-foreground outline-none transition-colors placeholder:text-muted-foreground/70 hover:border-[#cccccc] focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/20";

// Misma fila seleccionable con radio que usan los pasos 1 y 2.
const radioRowClass =
  "flex cursor-pointer items-center gap-3 border-b border-border py-3 text-foreground transition-colors last:border-b-0 has-data-checked:text-primary";

/** Indica si los campos obligatorios del paso están completos. */
export function isMedicalDataValid(data: MedicalData): boolean {
  // El año del análisis es opcional y no afecta la validación.
  const hipertensoOk =
    data.hipertenso === "no" ||
    (data.hipertenso === "si" && data.hipertensoAnios.trim().length > 0);

  const diabeticoOk =
    data.diabetico === "no" ||
    (data.diabetico === "si" &&
      data.diabeticoAnios.trim().length > 0 &&
      data.usaInsulina !== "");

  const colesterolOk =
    data.colesterol === "no" ||
    (data.colesterol === "si" && data.colesterolMedicacion !== "");

  return hipertensoOk && diabeticoOk && colesterolOk;
}

interface MedicalStepProps {
  value: MedicalData;
  onChange: (patch: Partial<MedicalData>) => void;
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
  disabled,
  onValueChange,
}: {
  legend: string;
  value: SiNo;
  disabled?: boolean;
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
        disabled={disabled}
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

/** Campo numérico de años reutilizable. */
function YearsField({
  id,
  label,
  value,
  disabled,
  onValueChange,
}: {
  id: string;
  label: string;
  value: string;
  disabled?: boolean;
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
        maxLength={3}
        value={value}
        onChange={(e) => onValueChange(e.target.value.replace(/\D/g, "").slice(0, 3))}
        className={inputClass}
        placeholder="Ej: 5"
        disabled={disabled}
      />
    </div>
  );
}

export function MedicalStep({ value, onChange }: MedicalStepProps) {
  const hipertensoYes = value.hipertenso === "si";
  const diabeticoYes = value.diabetico === "si";
  const colesterolYes = value.colesterol === "si";

  return (
    <div className="mt-8 flex flex-col gap-6">
      {/* ¿Es hipertenso? */}
      <SiNoQuestion
        legend="¿Es hipertenso?"
        value={value.hipertenso}
        onValueChange={(v) =>
          onChange(
            v === "no"
              ? { hipertenso: v, hipertensoAnios: "" }
              : { hipertenso: v },
          )
        }
      />
      <Collapsible open={hipertensoYes}>
        <YearsField
          id="hipertenso-anios"
          label="¿Hace cuántos años?"
          value={value.hipertensoAnios}
          disabled={!hipertensoYes}
          onValueChange={(v) => onChange({ hipertensoAnios: v })}
        />
      </Collapsible>

      {/* ¿Es diabético? */}
      <SiNoQuestion
        legend="¿Es diabético?"
        value={value.diabetico}
        onValueChange={(v) =>
          onChange(
            v === "no"
              ? { diabetico: v, diabeticoAnios: "", usaInsulina: "" }
              : { diabetico: v },
          )
        }
      />
      <Collapsible open={diabeticoYes}>
        <YearsField
          id="diabetico-anios"
          label="¿Hace cuántos años?"
          value={value.diabeticoAnios}
          disabled={!diabeticoYes}
          onValueChange={(v) => onChange({ diabeticoAnios: v })}
        />
        <SiNoQuestion
          legend="¿Usa insulina?"
          value={value.usaInsulina}
          disabled={!diabeticoYes}
          onValueChange={(v) => onChange({ usaInsulina: v })}
        />
      </Collapsible>

      {/* ¿Tiene colesterol alto? */}
      <SiNoQuestion
        legend="¿Tiene colesterol alto?"
        value={value.colesterol}
        onValueChange={(v) =>
          onChange(
            v === "no"
              ? { colesterol: v, colesterolMedicacion: "" }
              : { colesterol: v },
          )
        }
      />
      <Collapsible open={colesterolYes}>
        <SiNoQuestion
          legend="¿Toma medicación para el colesterol?"
          value={value.colesterolMedicacion}
          disabled={!colesterolYes}
          onValueChange={(v) => onChange({ colesterolMedicacion: v })}
        />
      </Collapsible>

      {/* Año del último análisis de sangre (opcional) */}
      <div className="flex flex-col gap-2">
        <label htmlFor="anio-analisis" className="text-[1em] font-medium text-foreground">
          ¿En qué año fue tu último análisis de sangre?
        </label>
        <input
          id="anio-analisis"
          name="anio-analisis"
          type="text"
          inputMode="numeric"
          maxLength={4}
          value={value.anioAnalisis}
          onChange={(e) =>
            onChange({ anioAnalisis: e.target.value.replace(/\D/g, "").slice(0, 4) })
          }
          className={inputClass}
          placeholder="Ej: 2024"
        />
        <p className="text-[0.8125em] leading-relaxed text-muted-foreground">
          Si no lo recordás con exactitud, podés dejarlo en blanco.
        </p>
      </div>
    </div>
  );
}

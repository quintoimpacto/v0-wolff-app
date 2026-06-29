import type { PersonalData } from "@/app/formulario/personal-data-step";
import type { ActivityData } from "@/app/formulario/activity-step";
import type { MedicalData } from "@/app/formulario/medical-step";
import type { HabitsData } from "@/app/formulario/habits-step";

export type { PersonalData, ActivityData, MedicalData, HabitsData };

/** Datos que el formulario envía al servidor. */
export interface PatientFormPayload {
  personal: PersonalData;
  activity: ActivityData;
  medical: MedicalData;
  habits: HabitsData;
}

/** Registro completo tal como lo devuelve la base de datos. */
export interface PatientRecord {
  id: string;
  submitted_at: string;
  nombre: string;
  dni: string;
  edad: number | null;
  fecha_nacimiento: string | null;
  archived: boolean;
  personal: PersonalData;
  activity: ActivityData;
  medical: MedicalData;
  habits: HabitsData;
}

/** Versión liviana para la lista del panel. */
export interface PatientListItem {
  id: string;
  submitted_at: string;
  nombre: string;
  dni: string;
  edad: number | null;
}

// ── Helpers de fecha/edad (seguros para servidor, sin "use client") ──

/** Valida que día/mes/año formen una fecha real dentro de un rango razonable. */
export function isValidBirthDateParts(day: string, month: string, year: string): boolean {
  if (!/^\d{4}$/.test(year)) return false;
  const d = Number(day);
  const m = Number(month);
  const y = Number(year);
  if (!d || !m || !y) return false;
  const currentYear = new Date().getFullYear();
  if (y < currentYear - 100 || y > currentYear) return false;
  const dt = new Date(y, m - 1, d);
  return dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d;
}

/** Calcula la edad en años a partir de las partes de la fecha de nacimiento. */
export function calcAgeFromParts(day: string, month: string, year: string): number | null {
  if (!isValidBirthDateParts(day, month, year)) return null;
  const birth = new Date(Number(year), Number(month) - 1, Number(day));
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

/** Devuelve la fecha de nacimiento en formato ISO (YYYY-MM-DD) o null. */
export function birthDateISO(day: string, month: string, year: string): string | null {
  if (!isValidBirthDateParts(day, month, year)) return null;
  const m = String(Number(month)).padStart(2, "0");
  const d = String(Number(day)).padStart(2, "0");
  return `${year}-${m}-${d}`;
}

// ── Etiquetas legibles para la vista de detalle ──

export const SEXO_LABELS: Record<string, string> = {
  masculino: "Masculino",
  femenino: "Femenino",
  prefiero_no_decir: "Prefiero no decir",
};

export const SI_NO_LABELS: Record<string, string> = {
  si: "Sí",
  no: "No",
};

export const PRACTICA_LABELS: Record<string, string> = {
  si: "Sí",
  no: "No",
};

export const HORAS_LABELS: Record<string, string> = {
  menos_3: "Menos de 3 horas",
  "3_a_6": "De 3 a 6 horas",
  mas_6: "Más de 6 horas",
};

export const HACE_CUANTO_LABELS: Record<string, string> = {
  "1_anio": "1 año",
  "2_a_5": "2 a 5 años",
  mas_5: "Más de 5 años",
};

export const FUMA_LABELS: Record<string, string> = {
  no: "No fuma",
  si: "Fuma actualmente",
  ex: "Ex fumador (dejó)",
};

export const ALIMENTACION_LABELS: Record<string, string> = {
  sin_restricciones: "Sin restricciones",
  vegetariana: "Vegetariana",
  vegana: "Vegana",
  baja_sodio: "Baja en sodio",
  baja_grasas: "Baja en grasas",
  otra: "Otra",
};

/** Devuelve la etiqueta o un guion si está vacío. */
export function label(map: Record<string, string>, value: string): string {
  return value && map[value] ? map[value] : "—";
}

/** Texto para campos libres (devuelve guion si vacío). */
export function orDash(value: string | null | undefined): string {
  return value && String(value).trim().length > 0 ? String(value) : "—";
}

/** Hora de envío formateada (HH:MM) en horario de Argentina. */
export function formatTime(iso: string): string {
  return new Intl.DateTimeFormat("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Argentina/Buenos_Aires",
  }).format(new Date(iso));
}

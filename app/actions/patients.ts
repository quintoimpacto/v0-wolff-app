"use server";

import { getSupabaseAdmin } from "@/lib/supabase";
import {
  birthDateISO,
  calcAgeFromParts,
  type PatientFormPayload,
} from "@/lib/patients";

export type SubmitResult =
  | { ok: true; nombre: string }
  | { ok: false; error: string };

/** Guarda un formulario de paciente completo en la base de datos. */
export async function submitPatient(
  payload: PatientFormPayload,
): Promise<SubmitResult> {
  const { personal } = payload;

  // Validación mínima en el servidor (defensa además de la del cliente).
  if (!personal?.fullName?.trim() || !personal?.dni?.trim()) {
    return { ok: false, error: "Faltan datos obligatorios del paciente." };
  }

  const edad = calcAgeFromParts(personal.day, personal.month, personal.year);
  const fechaNacimiento = birthDateISO(personal.day, personal.month, personal.year);

  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("patients").insert({
      nombre: personal.fullName.trim(),
      dni: personal.dni.trim(),
      edad,
      fecha_nacimiento: fechaNacimiento,
      personal: payload.personal,
      activity: payload.activity,
      medical: payload.medical,
      habits: payload.habits,
    });

    if (error) {
      console.log("[v0] submitPatient insert error:", error.message);
      return {
        ok: false,
        error: "No pudimos guardar tus datos. Revisá tu conexión e intentá de nuevo.",
      };
    }

    return { ok: true, nombre: personal.fullName.trim() };
  } catch (err) {
    console.log("[v0] submitPatient exception:", (err as Error).message);
    return {
      ok: false,
      error: "No pudimos conectar con el servidor. Revisá tu conexión e intentá de nuevo.",
    };
  }
}

/** Archiva un paciente (marca como atendido). No lo borra de la base. */
export async function archivePatient(
  id: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from("patients")
      .update({ archived: true })
      .eq("id", id);

    if (error) {
      console.log("[v0] archivePatient error:", error.message);
      return { ok: false, error: "No pudimos archivar al paciente. Intentá de nuevo." };
    }
    return { ok: true };
  } catch (err) {
    console.log("[v0] archivePatient exception:", (err as Error).message);
    return { ok: false, error: "Error de conexión al archivar." };
  }
}

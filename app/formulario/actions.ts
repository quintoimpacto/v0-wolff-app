"use server";

import { createAdminClient } from "@/lib/supabase/admin";

export interface GuardarPacientePayload {
  fullName: string;
  dni: string;
  birthDate: string | null; // ISO "YYYY-MM-DD"
  edad: number | null;
  datos: {
    personal: Record<string, string>;
    activity: Record<string, string>;
    medical: Record<string, string>;
    habits: Record<string, string>;
  };
}

export type GuardarPacienteResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

export async function guardarPaciente(
  payload: GuardarPacientePayload,
): Promise<GuardarPacienteResult> {
  const fullName = payload.fullName?.trim();
  const dni = payload.dni?.trim();

  if (!fullName || !dni) {
    return { ok: false, error: "Faltan datos obligatorios del paciente." };
  }

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("pacientes")
      .insert({
        full_name: fullName,
        dni,
        birth_date: payload.birthDate,
        edad: payload.edad,
        datos: payload.datos,
      })
      .select("id")
      .single();

    if (error) {
      console.log("[v0] Error al guardar paciente:", error.message);
      return { ok: false, error: "No pudimos guardar la información." };
    }

    return { ok: true, id: data.id as string };
  } catch (err) {
    console.log("[v0] Excepción al guardar paciente:", (err as Error).message);
    return { ok: false, error: "No pudimos conectar con el servidor." };
  }
}

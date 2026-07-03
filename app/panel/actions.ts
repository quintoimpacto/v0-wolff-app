"use server";

import { createAdminClient } from "@/lib/supabase/admin";

export type MarcarAtendidoResult =
  | { ok: true }
  | { ok: false; error: string };

/** Archiva al paciente: ya no aparece en la lista, pero no se borra. */
export async function marcarAtendido(id: string): Promise<MarcarAtendidoResult> {
  if (!id) return { ok: false, error: "Falta el identificador del paciente." };

  try {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("pacientes")
      .update({ atendido: true, atendido_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      console.log("[v0] Error al marcar atendido:", error.message);
      return { ok: false, error: "No se pudo actualizar el paciente." };
    }

    return { ok: true };
  } catch (err) {
    console.log("[v0] Excepción al marcar atendido:", (err as Error).message);
    return { ok: false, error: "Error de conexión." };
  }
}

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

/** Devuelve la fecha de hoy (AR, UTC-3) como inicio de día en ISO. */
function inicioDeHoyAR(): string {
  const ahora = new Date();
  const ymd = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Argentina/Buenos_Aires",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(ahora);
  // Argentina es UTC-3 (sin horario de verano).
  return `${ymd}T00:00:00-03:00`;
}

export async function GET() {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("pacientes")
      .select("*")
      // Incluye atendidos y no atendidos: los atendidos van al fondo (atendido asc),
      // y dentro de cada grupo, los más recientes primero.
      .gte("created_at", inicioDeHoyAR())
      .order("atendido", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) {
      console.log("[v0] Error al listar pacientes:", error.message);
      return NextResponse.json({ error: "No se pudo obtener la lista." }, { status: 500 });
    }

    return NextResponse.json({ pacientes: data ?? [] });
  } catch (err) {
    console.log("[v0] Excepción al listar pacientes:", (err as Error).message);
    return NextResponse.json({ error: "Error de conexión." }, { status: 500 });
  }
}

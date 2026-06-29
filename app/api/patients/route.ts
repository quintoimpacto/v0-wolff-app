import { NextResponse } from "next/server";
import { getSupabaseAdmin, hasSupabaseCredentials } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/** Inicio del día de hoy en horario de Argentina (UTC-3, sin DST). */
function startOfTodayISO(): string {
  const ymd = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Argentina/Buenos_Aires",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  return `${ymd}T00:00:00-03:00`;
}

/** GET /api/patients — pacientes de hoy, no archivados, más recientes primero. */
export async function GET() {
  if (!hasSupabaseCredentials()) {
    return NextResponse.json(
      { configured: false, patients: [] },
      { status: 200 },
    );
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("patients")
      .select("id, submitted_at, nombre, dni, edad")
      .eq("archived", false)
      .gte("submitted_at", startOfTodayISO())
      .order("submitted_at", { ascending: false });

    if (error) {
      console.log("[v0] GET /api/patients error:", error.message);
      return NextResponse.json({ error: "db_error" }, { status: 500 });
    }

    return NextResponse.json({ configured: true, patients: data ?? [] });
  } catch (err) {
    console.log("[v0] GET /api/patients exception:", (err as Error).message);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}

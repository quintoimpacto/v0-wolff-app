import { NextResponse } from "next/server";
import { getSupabaseAdmin, hasSupabaseCredentials } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/** GET /api/patients/[id] — ficha completa de un paciente. */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!hasSupabaseCredentials()) {
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  const { id } = await params;

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("patients")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }

    return NextResponse.json({ patient: data });
  } catch (err) {
    console.log("[v0] GET /api/patients/[id] exception:", (err as Error).message);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}

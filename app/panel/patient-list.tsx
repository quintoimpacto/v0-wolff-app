"use client";

import useSWR from "swr";
import { ChevronRight, Users, AlertTriangle, RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatTime, type PatientListItem } from "@/lib/patients";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface PatientsResponse {
  configured: boolean;
  patients: PatientListItem[];
}

interface PatientListProps {
  onSelect: (id: string) => void;
}

export function PatientList({ onSelect }: PatientListProps) {
  // Auto-refresco cada 30s para mostrar nuevos pacientes sin recargar.
  const { data, error, isLoading } = useSWR<PatientsResponse>(
    "/api/patients",
    fetcher,
    { refreshInterval: 30000, revalidateOnFocus: true },
  );

  if (isLoading && !data) {
    return (
      <div className="mt-8 flex flex-col gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="mt-8">
        <CardContent className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertTriangle className="size-7" aria-hidden="true" />
          </span>
          <p className="text-lg font-medium text-foreground">No se pudo cargar la lista</p>
          <p className="max-w-sm text-balance text-sm leading-relaxed text-muted-foreground">
            Revisá la conexión. La lista se reintenta automáticamente.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Credenciales de Supabase no configuradas todavía.
  if (data && data.configured === false) {
    return (
      <Card className="mt-8">
        <CardContent className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-secondary text-muted-foreground">
            <AlertTriangle className="size-7" aria-hidden="true" />
          </span>
          <p className="text-lg font-medium text-foreground">Base de datos sin configurar</p>
          <p className="max-w-sm text-balance text-sm leading-relaxed text-muted-foreground">
            Falta conectar Supabase. Cargá las variables de entorno SUPABASE_URL y
            SUPABASE_SERVICE_ROLE_KEY y ejecutá el script de la tabla.
          </p>
        </CardContent>
      </Card>
    );
  }

  const patients = data?.patients ?? [];

  if (patients.length === 0) {
    return (
      <Card className="mt-8">
        <CardContent className="flex flex-col items-center justify-center gap-3 px-6 py-20 text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-secondary text-muted-foreground">
            <Users className="size-7" aria-hidden="true" />
          </span>
          <p className="text-lg font-medium text-foreground">Todavía no hay pacientes</p>
          <p className="max-w-sm text-balance text-sm leading-relaxed text-muted-foreground">
            Cuando los pacientes completen el formulario en la sala de espera, sus
            fichas van a aparecer acá.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mt-6 flex flex-col gap-4">
      <p className="flex items-center gap-2 text-xs text-muted-foreground">
        <RefreshCw className="size-3.5" aria-hidden="true" />
        Se actualiza automáticamente cada 30 segundos.
      </p>
      <ul className="flex flex-col gap-3">
        {patients.map((p) => (
          <li key={p.id}>
            <button
              type="button"
              onClick={() => onSelect(p.id)}
              className="flex w-full items-center justify-between gap-4 rounded-2xl border border-border bg-background p-4 text-left transition-colors hover:border-primary/40 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
            >
              <div className="flex min-w-0 flex-col gap-1">
                <span className="truncate text-base font-semibold text-foreground">
                  {p.nombre}
                </span>
                <span className="text-sm text-muted-foreground">
                  DNI {p.dni}
                  {p.edad !== null ? ` · ${p.edad} años` : ""}
                </span>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">
                  {formatTime(p.submitted_at)}
                </span>
                <ChevronRight className="size-5 text-muted-foreground" aria-hidden="true" />
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

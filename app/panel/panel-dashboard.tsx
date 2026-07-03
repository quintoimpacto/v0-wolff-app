"use client";

import { useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  ChevronRight,
  Clock,
  Loader2,
  RefreshCw,
  Users,
} from "lucide-react";
import { WolffLogo } from "@/components/wolff-logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  buildDetalle,
  formatHora,
  type Paciente,
} from "@/lib/pacientes";
import { marcarAtendido } from "./actions";

const fetcher = async (url: string): Promise<{ pacientes: Paciente[] }> => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("No se pudo obtener la lista.");
  return res.json();
};

export function PanelDashboard() {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // SWR refresca la lista cada 30s automáticamente (y al recuperar foco).
  const { data, error, isLoading, mutate } = useSWR("/api/pacientes", fetcher, {
    refreshInterval: 30_000,
    revalidateOnFocus: true,
  });

  const pacientes = data?.pacientes ?? [];
  const selected = pacientes.find((p) => p.id === selectedId) ?? null;

  const today = new Intl.DateTimeFormat("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  return (
    <div className="flex min-h-dvh flex-col bg-secondary">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-6 py-4">
          <WolffLogo width={130} height={94} className="h-11 w-auto" priority />
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<Link href="/">Salir</Link>}
          />
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
        {selected ? (
          <PatientDetail
            paciente={selected}
            onBack={() => setSelectedId(null)}
            onArchived={async () => {
              setSelectedId(null);
              await mutate();
            }}
          />
        ) : (
          <>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div className="flex flex-col gap-1.5">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                  Pacientes de hoy
                </h1>
                <p className="flex items-center gap-2 text-sm capitalize text-muted-foreground">
                  <CalendarDays className="size-4" aria-hidden="true" />
                  {today}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {pacientes.length > 0 ? (
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
                    {pacientes.length} en espera
                  </span>
                ) : null}
                <button
                  type="button"
                  onClick={() => mutate()}
                  className="flex size-9 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-colors hover:bg-muted"
                  aria-label="Actualizar lista"
                >
                  <RefreshCw
                    className={"size-4" + (isLoading ? " animate-spin" : "")}
                    aria-hidden="true"
                  />
                </button>
              </div>
            </div>

            <PatientList
              pacientes={pacientes}
              loading={isLoading}
              hasError={Boolean(error)}
              onRetry={() => mutate()}
              onSelect={setSelectedId}
            />
          </>
        )}
      </main>
    </div>
  );
}

function PatientList({
  pacientes,
  loading,
  hasError,
  onRetry,
  onSelect,
}: {
  pacientes: Paciente[];
  loading: boolean;
  hasError: boolean;
  onRetry: () => void;
  onSelect: (id: string) => void;
}) {
  if (loading && pacientes.length === 0) {
    return (
      <Card className="mt-8">
        <CardContent className="flex flex-col items-center justify-center gap-3 px-6 py-20 text-center">
          <Loader2 className="size-7 animate-spin text-muted-foreground" aria-hidden="true" />
          <p className="text-sm text-muted-foreground">Cargando pacientes...</p>
        </CardContent>
      </Card>
    );
  }

  if (hasError) {
    return (
      <Card className="mt-8">
        <CardContent className="flex flex-col items-center justify-center gap-4 px-6 py-16 text-center">
          <p className="text-lg font-medium text-foreground">
            No pudimos cargar la lista
          </p>
          <p className="max-w-sm text-balance text-sm leading-relaxed text-muted-foreground">
            Revisá tu conexión e intentá de nuevo.
          </p>
          <Button variant="outline" onClick={onRetry}>
            <RefreshCw className="size-4" data-icon="inline-start" aria-hidden="true" />
            Reintentar
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (pacientes.length === 0) {
    return (
      <Card className="mt-8">
        <CardContent className="flex flex-col items-center justify-center gap-3 px-6 py-20 text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-secondary text-muted-foreground">
            <Users className="size-7" aria-hidden="true" />
          </span>
          <p className="text-lg font-medium text-foreground">
            Todavía no hay pacientes
          </p>
          <p className="max-w-sm text-balance text-sm leading-relaxed text-muted-foreground">
            Cuando los pacientes completen el formulario en la sala de espera, sus fichas
            van a aparecer acá. La lista se actualiza sola.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <ul className="mt-8 flex flex-col gap-3">
      {pacientes.map((p) => (
        <li key={p.id}>
          <button
            type="button"
            onClick={() => onSelect(p.id)}
            className="flex w-full items-center gap-4 rounded-xl border border-border bg-background p-4 text-left transition-colors hover:border-primary/40 hover:bg-muted/50"
          >
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
              {initials(p.full_name)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-foreground">{p.full_name}</p>
              <p className="truncate text-sm text-muted-foreground">
                DNI {p.dni}
                {p.edad != null ? ` · ${p.edad} años` : ""}
              </p>
            </div>
            <span className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
              <Clock className="size-4" aria-hidden="true" />
              {formatHora(p.created_at)}
            </span>
            <ChevronRight className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
          </button>
        </li>
      ))}
    </ul>
  );
}

function PatientDetail({
  paciente,
  onBack,
  onArchived,
}: {
  paciente: Paciente;
  onBack: () => void;
  onArchived: () => Promise<void>;
}) {
  const [archiving, setArchiving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const secciones = buildDetalle(paciente);

  async function handleArchive() {
    setError(null);
    setArchiving(true);
    const result = await marcarAtendido(paciente.id);
    if (result.ok) {
      await onArchived();
    } else {
      setArchiving(false);
      setError(result.error);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <button
        type="button"
        onClick={onBack}
        className="flex w-fit items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Volver a la lista
      </button>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
            {initials(paciente.full_name)}
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {paciente.full_name}
            </h1>
            <p className="text-sm text-muted-foreground">
              DNI {paciente.dni}
              {paciente.edad != null ? ` · ${paciente.edad} años` : ""} · Enviado a las{" "}
              {formatHora(paciente.created_at)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {secciones.map((seccion) => (
          <Card key={seccion.title}>
            <CardContent className="flex flex-col gap-3 p-5">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-primary">
                {seccion.title}
              </h2>
              <dl className="flex flex-col gap-2.5">
                {seccion.items.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-start justify-between gap-4 border-b border-border/60 pb-2.5 last:border-0 last:pb-0"
                  >
                    <dt className="text-sm text-muted-foreground">{item.label}</dt>
                    <dd className="text-right text-sm font-medium text-foreground">
                      {item.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </CardContent>
          </Card>
        ))}
      </div>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <Button variant="outline" onClick={onBack} disabled={archiving}>
          Volver
        </Button>
        <Button onClick={handleArchive} disabled={archiving}>
          {archiving ? (
            <>
              <Loader2 className="size-4 animate-spin" data-icon="inline-start" aria-hidden="true" />
              Archivando...
            </>
          ) : (
            <>
              <Check className="size-4" data-icon="inline-start" aria-hidden="true" />
              Marcar como atendido
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

/** Iniciales del nombre para el avatar. */
function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

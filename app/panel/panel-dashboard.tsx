"use client";

import { useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import {
  Activity,
  ArrowLeft,
  CalendarDays,
  Check,
  ChevronRight,
  ClipboardList,
  Clock,
  Download,
  Heart,
  Loader2,
  RefreshCw,
  User,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { WolffLogo } from "@/components/wolff-logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  buildDetalle,
  formatHora,
  pacientesToCsv,
  type Paciente,
} from "@/lib/pacientes";
import { marcarAtendido } from "./actions";

// Ícono de cada tab según el título de la sección.
const TAB_ICONS: Record<string, LucideIcon> = {
  "Datos personales": User,
  "Actividad física": Activity,
  "Antecedentes médicos": ClipboardList,
  "Hábitos y síntomas": Heart,
};

const fetcher = async (url: string): Promise<{ pacientes: Paciente[] }> => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("No se pudo obtener la lista.");
  return res.json();
};

export function PanelDashboard() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [archiving, setArchiving] = useState(false);
  const [archiveError, setArchiveError] = useState<string | null>(null);

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

  // Exporta los datos del paciente seleccionado como CSV (se abre en Excel/Sheets).
  function handleExport(paciente: Paciente) {
    const csv = pacientesToCsv([paciente]);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const slug = paciente.full_name
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    const link = document.createElement("a");
    link.href = url;
    link.download = `paciente-${slug || paciente.dni}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  async function handleArchive(paciente: Paciente) {
    setArchiveError(null);
    setArchiving(true);
    const result = await marcarAtendido(paciente.id);
    if (result.ok) {
      setSelectedId(null);
      await mutate();
      setArchiving(false);
    } else {
      setArchiving(false);
      setArchiveError(result.error);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col bg-secondary">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-6 py-4">
          <WolffLogo width={130} height={94} className="h-11 w-auto" priority />
          <div className="flex items-center gap-3">
            {selected ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport(selected)}
                  disabled={archiving}
                >
                  <Download className="size-4" data-icon="inline-start" aria-hidden="true" />
                  Exportar
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleArchive(selected)}
                  disabled={archiving}
                  className="bg-[#a0455d] text-white hover:bg-[#8c3b50]"
                >
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
              </>
            ) : null}
            <Button
              variant="outline"
              size="sm"
              nativeButton={false}
              render={<Link href="/">Salir</Link>}
            />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
        {selected ? (
          <PatientDetail
            paciente={selected}
            onBack={() => setSelectedId(null)}
            error={archiveError}
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
  error,
}: {
  paciente: Paciente;
  onBack: () => void;
  error: string | null;
}) {
  const [activeTab, setActiveTab] = useState(0);
  const secciones = buildDetalle(paciente);

  // Header: solo la edad como identificación rápida (el detalle completo va en la tab).
  const edadLabel = paciente.edad != null ? `${paciente.edad} años` : null;

  const activeSeccion = secciones[activeTab] ?? secciones[0];

  return (
    <div className="flex h-[calc(100dvh-10rem)] flex-col overflow-hidden rounded-xl border border-[#eceef1] bg-white text-[#1f2228]">
      {/* Header del paciente */}
      <div className="shrink-0 border-b border-[#eceef1] px-6 pb-5 pt-5">
        <button
          type="button"
          onClick={onBack}
          className="mb-4 flex w-fit items-center gap-2 text-sm font-medium text-[#6b6b67] transition-colors hover:text-[#111111]"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Volver a la lista
        </button>
        <h1 className="text-2xl font-bold tracking-tight text-[#111111]">
          {paciente.full_name}
        </h1>
        {edadLabel ? (
          <p className="mt-1 text-[16px] font-medium text-[#111111]">{edadLabel}</p>
        ) : null}
      </div>

      {/* Tabs */}
      <div
        role="tablist"
        aria-label="Secciones de la ficha"
        className="flex shrink-0 gap-1 overflow-x-auto border-b border-[#eceef1] px-4"
      >
        {secciones.map((seccion, index) => {
          const active = index === activeTab;
          const Icon = TAB_ICONS[seccion.title];
          return (
            <button
              key={seccion.title}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setActiveTab(index)}
              className={
                "flex shrink-0 items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-colors " +
                (active
                  ? "border-[#a0455d] text-[#a0455d]"
                  : "border-transparent text-[#6b6b67] hover:text-[#111111]")
              }
            >
              {Icon ? <Icon size={15} aria-hidden="true" /> : null}
              {seccion.title}
            </button>
          );
        })}
      </div>

      {/* Contenido de la tab activa (crece para llenar el espacio, sin scroll propio) */}
      <div className="flex-1 px-6 py-4">
        <dl className="flex flex-col">
          {activeSeccion.items.map((item, index) => {
            const firstSintoma =
              item.sintoma &&
              activeSeccion.items.findIndex((i) => i.sintoma) === index;
            const positiveRisk = item.risk && item.value === "Sí";
            return (
              <div key={item.label}>
                {firstSintoma ? (
                  <p className="pb-1.5 pt-4 text-xs font-semibold uppercase tracking-wide text-[#9b9b96]">
                    Síntomas
                  </p>
                ) : null}
                <div className="flex items-center justify-between gap-4 border-b border-[#f0f1f4] py-3">
                  <dt className="text-sm text-[#6b6b67]">{item.label}</dt>
                  <dd className="text-right">
                    {positiveRisk ? (
                      <span className="inline-flex items-center rounded-full bg-[#f0f0ee] px-2.5 py-0.5 text-xs font-semibold text-[#333333]">
                        {item.value}
                      </span>
                    ) : (
                      <span className="text-sm font-medium text-[#111111]">
                        {item.value}
                      </span>
                    )}
                  </dd>
                </div>
              </div>
            );
          })}
        </dl>
      </div>

      {/* Error de archivado (si ocurre) */}
      {error ? (
        <div className="shrink-0 border-t border-[#eceef1] bg-white px-6 py-3">
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        </div>
      ) : null}
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

"use client";

import { useState } from "react";
import useSWR from "swr";
import { ArrowLeft, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { archivePatient } from "@/app/actions/patients";
import {
  ALIMENTACION_LABELS,
  FUMA_LABELS,
  HACE_CUANTO_LABELS,
  HORAS_LABELS,
  PRACTICA_LABELS,
  SEXO_LABELS,
  SI_NO_LABELS,
  formatTime,
  label,
  orDash,
  type PatientRecord,
} from "@/lib/patients";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface PatientDetailProps {
  id: string;
  onBack: () => void;
  onArchived: () => void;
}

export function PatientDetail({ id, onBack, onArchived }: PatientDetailProps) {
  const { data, isLoading } = useSWR<{ patient: PatientRecord }>(
    `/api/patients/${id}`,
    fetcher,
  );
  const [archiving, setArchiving] = useState(false);
  const [archiveError, setArchiveError] = useState("");

  const patient = data?.patient;

  async function handleArchive() {
    setArchiving(true);
    setArchiveError("");
    const result = await archivePatient(id);
    if (result.ok) {
      onArchived();
    } else {
      setArchiveError(result.error);
      setArchiving(false);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col bg-secondary">
      <header className="sticky top-0 z-10 border-b border-border bg-background">
        <div className="mx-auto flex w-full max-w-2xl items-center gap-2 px-4 py-3">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="size-4" data-icon="inline-start" aria-hidden="true" />
            Volver
          </Button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6">
        {isLoading || !patient ? (
          <DetailSkeleton />
        ) : (
          <>
            {/* Encabezado del paciente */}
            <div className="flex flex-col gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                {patient.nombre}
              </h1>
              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="secondary">DNI {patient.dni}</Badge>
                {patient.edad !== null ? (
                  <Badge variant="secondary">{patient.edad} años</Badge>
                ) : null}
                <span>Ingresó {formatTime(patient.submitted_at)}</span>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-6">
              <Section title="Datos personales">
                <Row label="Nombre y apellido" value={orDash(patient.personal.fullName)} />
                <Row label="DNI" value={orDash(patient.personal.dni)} />
                <Row
                  label="Fecha de nacimiento"
                  value={orDash(patient.fecha_nacimiento)}
                />
                <Row
                  label="Edad"
                  value={patient.edad !== null ? `${patient.edad} años` : "—"}
                />
                <Row label="Peso" value={patient.personal.weight ? `${patient.personal.weight} kg` : "—"} />
                <Row label="Altura" value={patient.personal.height ? `${patient.personal.height} cm` : "—"} />
                <Row label="Sexo" value={label(SEXO_LABELS, patient.personal.sexo)} />
              </Section>

              <Section title="Actividad física">
                <Row
                  label="¿Practica deporte?"
                  value={label(PRACTICA_LABELS, patient.activity.practica)}
                />
                {patient.activity.practica === "si" ? (
                  <>
                    <Row
                      label="Horas por semana"
                      value={label(HORAS_LABELS, patient.activity.horasSemana)}
                    />
                    <Row
                      label="Hace cuánto"
                      value={label(HACE_CUANTO_LABELS, patient.activity.haceCuanto)}
                    />
                    <Row
                      label="Edad de inicio"
                      value={patient.activity.edadInicio ? `${patient.activity.edadInicio} años` : "—"}
                    />
                  </>
                ) : null}
              </Section>

              <Section title="Antecedentes médicos">
                <Row
                  label="Hipertenso"
                  value={label(SI_NO_LABELS, patient.medical.hipertenso)}
                />
                {patient.medical.hipertenso === "si" ? (
                  <Row
                    label="Hace cuántos años"
                    value={orDash(patient.medical.hipertensoAnios)}
                  />
                ) : null}
                <Row
                  label="Diabético"
                  value={label(SI_NO_LABELS, patient.medical.diabetico)}
                />
                {patient.medical.diabetico === "si" ? (
                  <>
                    <Row
                      label="Hace cuántos años"
                      value={orDash(patient.medical.diabeticoAnios)}
                    />
                    <Row
                      label="Usa insulina"
                      value={label(SI_NO_LABELS, patient.medical.usaInsulina)}
                    />
                  </>
                ) : null}
                <Row
                  label="Colesterol alto"
                  value={label(SI_NO_LABELS, patient.medical.colesterol)}
                />
                {patient.medical.colesterol === "si" ? (
                  <Row
                    label="Medicación para colesterol"
                    value={label(SI_NO_LABELS, patient.medical.colesterolMedicacion)}
                  />
                ) : null}
                <Row
                  label="Último análisis de sangre"
                  value={orDash(patient.medical.anioAnalisis)}
                />
              </Section>

              <Section title="Hábitos y síntomas">
                <Row label="Tabaquismo" value={label(FUMA_LABELS, patient.habits.fuma)} />
                {patient.habits.fuma === "si" ? (
                  <>
                    <Row label="Cigarrillos por día" value={orDash(patient.habits.cigarrillosDia)} />
                    <Row label="Desde qué edad" value={orDash(patient.habits.edadInicioFuma)} />
                  </>
                ) : null}
                {patient.habits.fuma === "ex" ? (
                  <>
                    <Row label="Cigarrillos por día (cuando fumaba)" value={orDash(patient.habits.exCigarrillosDia)} />
                    <Row label="Edad de inicio" value={orDash(patient.habits.exEdadInicio)} />
                    <Row label="Hace cuántos años dejó" value={orDash(patient.habits.exAniosDejo)} />
                    <Row label="Años que fumó en total" value={orDash(patient.habits.exAniosTotal)} />
                  </>
                ) : null}
                <Row
                  label="Alimentación"
                  value={label(ALIMENTACION_LABELS, patient.habits.alimentacion)}
                />
                <Separator className="my-1" />
                <Row label="Desmayos" value={label(SI_NO_LABELS, patient.habits.desmayos)} />
                <Row label="Dolor de pecho" value={label(SI_NO_LABELS, patient.habits.dolorPecho)} />
                <Row label="Palpitaciones" value={label(SI_NO_LABELS, patient.habits.palpitaciones)} />
              </Section>
            </div>

            {/* Acción: marcar como atendido */}
            <div className="mt-8 flex flex-col gap-3">
              {archiveError ? (
                <p className="text-sm text-destructive">{archiveError}</p>
              ) : null}
              <Button
                size="lg"
                className="h-12 w-full"
                onClick={handleArchive}
                disabled={archiving}
              >
                {archiving ? (
                  <>
                    <Loader2 className="size-5 animate-spin" data-icon="inline-start" aria-hidden="true" />
                    Archivando…
                  </>
                ) : (
                  <>
                    <Check className="size-5" data-icon="inline-start" aria-hidden="true" />
                    Marcar como atendido
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-background p-5">
      <h2 className="text-lg font-semibold tracking-tight text-foreground">{title}</h2>
      <dl className="mt-4 flex flex-col gap-3">{children}</dl>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-right text-sm font-medium text-foreground">{value}</dd>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-5 w-64" />
      </div>
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="h-40 w-full rounded-2xl" />
      ))}
    </div>
  );
}

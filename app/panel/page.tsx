"use client";

import { useState } from "react";
import Link from "next/link";
import { CalendarDays, Lock, Users } from "lucide-react";
import { WolffLogo } from "@/components/wolff-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Simple placeholder gate — not real authentication.
const PANEL_PASSWORD = "wolff";

export default function PanelPage() {
  const [authed, setAuthed] = useState(false);

  if (!authed) {
    return <PasswordGate onUnlock={() => setAuthed(true)} />;
  }

  return <PanelDashboard />;
}

function PasswordGate({ onUnlock }: { onUnlock: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password === PANEL_PASSWORD) {
      setError(false);
      onUnlock();
    } else {
      setError(true);
    }
  }

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-12">
      <Card className="w-full max-w-sm">
        <CardHeader className="items-center text-center">
          <WolffLogo width={140} height={101} className="mb-2 w-32" priority />
          <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Lock className="size-5" aria-hidden="true" />
          </span>
          <CardTitle className="text-xl">Panel médico</CardTitle>
          <CardDescription>Ingresá la contraseña para continuar</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(false);
                }}
                placeholder="••••••••"
                autoFocus
                aria-invalid={error}
              />
              {error ? (
                <p className="text-sm text-destructive">Contraseña incorrecta.</p>
              ) : null}
            </div>
            <Button type="submit" className="w-full">
              Entrar
            </Button>
            <Button
              variant="ghost"
              nativeButton={false}
              className="w-full text-muted-foreground"
              render={<Link href="/">Volver al inicio</Link>}
            />
          </form>
        </CardContent>
      </Card>
    </main>
  );
}

function PanelDashboard() {
  const today = new Intl.DateTimeFormat("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  return (
    <div className="flex min-h-dvh flex-col">
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
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold text-foreground">Pacientes de hoy</h1>
          <p className="flex items-center gap-2 text-sm capitalize text-muted-foreground">
            <CalendarDays className="size-4" aria-hidden="true" />
            {today}
          </p>
        </div>

        <Card className="mt-8">
          <CardContent className="flex flex-col items-center justify-center gap-3 px-6 py-20 text-center">
            <span className="flex size-14 items-center justify-center rounded-full bg-secondary text-muted-foreground">
              <Users className="size-7" aria-hidden="true" />
            </span>
            <p className="text-lg font-medium text-foreground">
              Todavía no hay pacientes
            </p>
            <p className="max-w-sm text-balance text-sm leading-relaxed text-muted-foreground">
              Cuando los pacientes completen el formulario en la sala de espera, sus
              fichas van a aparecer acá.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { Lock } from "lucide-react";
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
import { PanelDashboard } from "./panel-dashboard";

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
    <main className="flex min-h-dvh flex-1 items-center justify-center bg-secondary px-6 py-12">
      <Card className="w-full max-w-sm">
        <CardHeader className="items-center text-center">
          <WolffLogo width={140} height={101} className="w-32" priority />
          <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Lock className="size-5" aria-hidden="true" />
          </span>
          <CardTitle className="text-2xl font-bold tracking-tight">Panel médico</CardTitle>
          <CardDescription className="text-sm">
            Ingresá la contraseña para continuar
          </CardDescription>
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


"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Eye, EyeOff, Loader2, Lock } from "lucide-react";
import { WolffLogo } from "@/components/wolff-logo";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
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
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    // Pequeño delay para reflejar el estado de validación.
    setTimeout(() => {
      if (password === PANEL_PASSWORD) {
        setError(false);
        onUnlock();
      } else {
        setError(true);
        setLoading(false);
      }
    }, 500);
  }

  const isEmpty = password.trim().length === 0;

  return (
    <main className="flex min-h-dvh flex-1 items-center justify-center bg-secondary px-6 py-12">
      <Card className="w-full max-w-sm rounded-2xl border border-border/50 p-8 text-center shadow-sm">
        <CardContent className="flex flex-col items-center gap-0 p-0">
          <WolffLogo width={140} height={101} className="w-20" priority />

          <span className="mt-8 flex size-12 items-center justify-center rounded-full bg-[#f0f0ee] text-[#1a1a1a]">
            <Lock className="size-5" aria-hidden="true" />
          </span>

          <h1 className="mt-6 text-2xl font-bold leading-tight tracking-tight text-foreground">
            Panel médico
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Ingresá la contraseña para continuar
          </p>

          <form onSubmit={handleSubmit} className="mt-9 flex w-full flex-col gap-4 text-left">
            <div className="flex flex-col gap-2">
              <Label htmlFor="password" className="text-[13px] font-medium text-muted-foreground">
                Contraseña
              </Label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(false);
                  }}
                  placeholder="••••••••"
                  aria-invalid={error}
                  className="h-11 w-full rounded-lg border border-input bg-background pl-3.5 pr-11 text-base text-foreground outline-none transition-colors placeholder:text-muted-foreground/70 hover:border-[#cccccc] focus-visible:border-primary/60 focus-visible:ring-2 focus-visible:ring-primary/15 aria-invalid:border-destructive aria-invalid:focus-visible:ring-destructive/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  className="absolute right-1 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="size-4" aria-hidden="true" />
                  ) : (
                    <Eye className="size-4" aria-hidden="true" />
                  )}
                </button>
              </div>
              {error ? (
                <p className="text-[13px] text-destructive">
                  Contraseña incorrecta, intentá de nuevo
                </p>
              ) : null}
              <Link
                href="/"
                className="self-end text-[13px] text-muted-foreground no-underline transition-colors hover:text-foreground hover:underline"
              >
                ¿Olvidaste la contraseña?
              </Link>
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={isEmpty || loading}
              className="h-12 w-full rounded-lg bg-[#6b2c3e] text-base text-white hover:bg-[#5c2534] disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  Ingresando...
                </>
              ) : (
                "Entrar"
              )}
            </Button>
          </form>

          <Link
            href="/"
            className="mt-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Volver al inicio
          </Link>

          <p className="mt-6 text-xs text-muted-foreground/70">
            Acceso restringido a personal autorizado de Wolff Medicina del Deporte
          </p>
        </CardContent>
      </Card>
    </main>
  );
}


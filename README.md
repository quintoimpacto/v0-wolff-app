# WOLFF — Medicina del Deporte

Aplicación web para un centro cardiológico y de medicina deportiva.

## Secciones

- **`/formulario`** — Lo completan los pacientes en la sala de espera (mobile-first).
  Navegación de 4 pasos con barra de progreso y control de tamaño de texto (A- / A+):
  1. Datos personales
  2. Actividad física
  3. Antecedentes médicos
  4. Hábitos y síntomas
  Los campos de cada paso todavía no están implementados.

- **`/panel`** — Lo usa el médico (pensado para escritorio). Protegido con una
  contraseña simple de placeholder (`wolff`) — no es autenticación real.
  Muestra la lista "Pacientes de hoy" (por ahora vacía).

## Stack

- Next.js 16 (App Router) + React 19
- Tailwind CSS v4 + shadcn/ui (Base UI)

## Desarrollo

```bash
npm install
npm run dev
```

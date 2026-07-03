import { Client } from "pg";

const connectionString =
  process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL;

if (!connectionString) {
  console.error("[v0] Falta POSTGRES_URL_NON_POOLING / POSTGRES_URL");
  process.exit(1);
}

const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

const sql = `
create table if not exists public.pacientes (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  full_name text not null,
  dni text not null,
  birth_date date,
  edad integer,
  atendido boolean not null default false,
  atendido_at timestamptz,
  datos jsonb not null default '{}'::jsonb
);

create index if not exists pacientes_created_at_idx on public.pacientes (created_at desc);
create index if not exists pacientes_atendido_idx on public.pacientes (atendido);
`;

try {
  await client.connect();
  await client.query(sql);
  console.log("[v0] Tabla 'pacientes' lista.");
} catch (err) {
  console.error("[v0] Error creando la tabla:", err.message);
  process.exit(1);
} finally {
  await client.end();
}

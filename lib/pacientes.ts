/**
 * Tipos y helpers de presentación para las fichas de pacientes.
 * Es un módulo puro (sin "use client") que se usa tanto en el servidor
 * como en el panel para mostrar los datos de forma legible.
 */

export interface PacienteDatos {
  personal?: Record<string, string>;
  activity?: Record<string, string>;
  medical?: Record<string, string>;
  habits?: Record<string, string>;
}

export interface Paciente {
  id: string;
  created_at: string;
  full_name: string;
  dni: string;
  birth_date: string | null;
  edad: number | null;
  atendido: boolean;
  atendido_at: string | null;
  datos: PacienteDatos;
}

export interface DetalleItem {
  label: string;
  value: string;
}

export interface DetalleSeccion {
  title: string;
  items: DetalleItem[];
}

const SEXO: Record<string, string> = {
  masculino: "Masculino",
  femenino: "Femenino",
  prefiero_no_decir: "Prefiero no decir",
};

const SI_NO: Record<string, string> = { si: "Sí", no: "No" };

const HORAS: Record<string, string> = {
  menos_3: "Menos de 3 horas",
  "3_a_6": "De 3 a 6 horas",
  mas_6: "Más de 6 horas",
};

const HACE_CUANTO: Record<string, string> = {
  "1_anio": "1 año",
  "2_a_5": "2 a 5 años",
  mas_5: "Más de 5 años",
};

const FUMA: Record<string, string> = {
  no: "No",
  si: "Sí",
  ex: "Ex fumador (dejó)",
};

const ALIMENTACION: Record<string, string> = {
  sin_restricciones: "Sin restricciones",
  vegetariana: "Vegetariana",
  vegana: "Vegana",
  baja_sodio: "Baja en sodio",
  baja_grasas: "Baja en grasas",
  otra: "Otra",
};

function label(map: Record<string, string>, value?: string): string {
  if (!value) return "—";
  return map[value] ?? value;
}

function text(value?: string): string {
  return value && value.trim().length > 0 ? value : "—";
}

/** Formatea la hora de envío en horario local argentino. */
export function formatHora(iso: string): string {
  return new Intl.DateTimeFormat("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

/** Construye las secciones legibles de la ficha para la vista de detalle. */
export function buildDetalle(p: Paciente): DetalleSeccion[] {
  const personal = p.datos.personal ?? {};
  const activity = p.datos.activity ?? {};
  const medical = p.datos.medical ?? {};
  const habits = p.datos.habits ?? {};

  const secciones: DetalleSeccion[] = [];

  // Datos personales
  const personalItems: DetalleItem[] = [
    { label: "Nombre y apellido", value: text(p.full_name) },
    { label: "DNI", value: text(p.dni) },
    { label: "Edad", value: p.edad != null ? `${p.edad} años` : "—" },
    {
      label: "Fecha de nacimiento",
      value: p.birth_date
        ? new Intl.DateTimeFormat("es-AR").format(new Date(p.birth_date + "T00:00:00"))
        : "—",
    },
    { label: "Sexo", value: label(SEXO, personal.sexo) },
    { label: "Peso", value: personal.weight ? `${personal.weight} kg` : "—" },
    { label: "Altura", value: personal.height ? `${personal.height} cm` : "—" },
  ];
  secciones.push({ title: "Datos personales", items: personalItems });

  // Actividad física
  const activityItems: DetalleItem[] = [
    { label: "Practica deporte", value: label(SI_NO, activity.practica) },
  ];
  if (activity.practica === "si") {
    activityItems.push(
      { label: "Horas por semana", value: label(HORAS, activity.horasSemana) },
      { label: "Hace cuánto", value: label(HACE_CUANTO, activity.haceCuanto) },
      { label: "Edad de inicio", value: activity.edadInicio ? `${activity.edadInicio} años` : "—" },
    );
  }
  secciones.push({ title: "Actividad física", items: activityItems });

  // Antecedentes médicos
  const medicalItems: DetalleItem[] = [
    { label: "Hipertenso", value: label(SI_NO, medical.hipertenso) },
  ];
  if (medical.hipertenso === "si") {
    medicalItems.push({ label: "Hace cuántos años (hipertensión)", value: text(medical.hipertensoAnios) });
  }
  medicalItems.push({ label: "Diabético", value: label(SI_NO, medical.diabetico) });
  if (medical.diabetico === "si") {
    medicalItems.push(
      { label: "Hace cuántos años (diabetes)", value: text(medical.diabeticoAnios) },
      { label: "Usa insulina", value: label(SI_NO, medical.usaInsulina) },
    );
  }
  medicalItems.push({ label: "Colesterol alto", value: label(SI_NO, medical.colesterol) });
  if (medical.colesterol === "si") {
    medicalItems.push({ label: "Medicación para colesterol", value: label(SI_NO, medical.colesterolMedicacion) });
  }
  medicalItems.push({ label: "Último análisis de sangre", value: text(medical.anioAnalisis) });
  secciones.push({ title: "Antecedentes médicos", items: medicalItems });

  // Hábitos y síntomas
  const habitsItems: DetalleItem[] = [
    { label: "Fuma", value: label(FUMA, habits.fuma) },
  ];
  if (habits.fuma === "si") {
    habitsItems.push(
      { label: "Cigarrillos por día", value: text(habits.cigarrillosDia) },
      { label: "Desde qué edad fuma", value: habits.edadInicioFuma ? `${habits.edadInicioFuma} años` : "—" },
    );
  }
  if (habits.fuma === "ex") {
    habitsItems.push(
      { label: "Cigarrillos por día (antes)", value: text(habits.exCigarrillosDia) },
      { label: "Edad de inicio", value: habits.exEdadInicio ? `${habits.exEdadInicio} años` : "—" },
      { label: "Hace cuánto que dejó", value: habits.exAniosDejo ? `${habits.exAniosDejo} años` : "—" },
      { label: "Tiempo total que fumó", value: habits.exAniosTotal ? `${habits.exAniosTotal} años` : "—" },
    );
  }
  habitsItems.push(
    { label: "Alimentación", value: label(ALIMENTACION, habits.alimentacion) },
    { label: "Desmayos", value: label(SI_NO, habits.desmayos) },
    { label: "Dolor de pecho", value: label(SI_NO, habits.dolorPecho) },
    { label: "Palpitaciones", value: label(SI_NO, habits.palpitaciones) },
  );
  secciones.push({ title: "Hábitos y síntomas", items: habitsItems });

  return secciones;
}

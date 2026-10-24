// Textos de horarios para mostrar en el sitio: "Lunes a viernes · 9 a 13 y 17 a 21".

export type Franja = { diaSemana: number; desde: string; hasta: string };

const NOMBRE_DIA = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const ORDEN_SEMANA = [1, 2, 3, 4, 5, 6, 0]; // de lunes a domingo

/** "09:00" → "9", "17:30" → "17:30" */
function hora(hhmm: string): string {
  const [h, m] = hhmm.split(":");
  return m === "00" ? String(Number(h)) : `${Number(h)}:${m}`;
}

function textoDelDia(franjas: Franja[]): string {
  if (franjas.length === 0) return "Cerrado";
  const tramos = [...franjas].sort((a, b) => a.desde.localeCompare(b.desde)).map((f) => `${hora(f.desde)} a ${hora(f.hasta)}`);
  return tramos.length === 1 ? tramos[0] : `${tramos.slice(0, -1).join(", ")} y ${tramos.at(-1)}`;
}

function nombreGrupo(dias: number[]): string {
  const primero = NOMBRE_DIA[dias[0]];
  const ultimo = NOMBRE_DIA[dias.at(-1)!].toLowerCase();
  if (dias.length === 1) return primero;
  if (dias.length === 2) return `${primero} y ${ultimo}`;
  return `${primero} a ${ultimo}`;
}

/** Agrupa los días seguidos que tienen el mismo horario. */
export function resumirHorarios(franjas: Franja[]): { dias: string; horario: string }[] {
  const grupos: { dias: number[]; horario: string }[] = [];
  for (const dia of ORDEN_SEMANA) {
    const horario = textoDelDia(franjas.filter((f) => f.diaSemana === dia));
    const anterior = grupos.at(-1);
    if (anterior && anterior.horario === horario) anterior.dias.push(dia);
    else grupos.push({ dias: [dia], horario });
  }
  return grupos.map((g) => ({ dias: nombreGrupo(g.dias), horario: g.horario }));
}

/** 30 → "30 min", 60 → "1 h", 90 → "1 h 30 min" */
export function formatearDuracion(minutos: number): string {
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  if (h === 0) return `${m} min`;
  return m === 0 ? `${h} h` : `${h} h ${m} min`;
}

import { TZDate } from "@date-fns/tz";
import { addDays, format } from "date-fns";
import { es } from "date-fns/locale";

// En la base todo se guarda en UTC. Estas funciones convierten a la hora local de la
// veterinaria solo para mostrar o para interpretar lo que carga el usuario.

export const ZONA_POR_DEFECTO = process.env.TZ_APP ?? "America/Argentina/Tucuman";

/** Instante (UTC) que corresponde a un día "yyyy-MM-dd" y hora "HH:mm" locales. */
export function localAUtc(dia: string, hora: string, zona = ZONA_POR_DEFECTO): Date {
  const [anio, mes, d] = dia.split("-").map(Number);
  const [h, m] = hora.split(":").map(Number);
  return new Date(new TZDate(anio, mes - 1, d, h, m, zona).getTime());
}

/** La fecha vista desde la zona de la veterinaria (para leer día, hora, día de semana). */
export function enZona(fecha: Date, zona = ZONA_POR_DEFECTO): TZDate {
  return new TZDate(fecha, zona);
}

/** Día local "yyyy-MM-dd" de un instante. */
export function diaLocal(fecha: Date, zona = ZONA_POR_DEFECTO): string {
  return format(enZona(fecha, zona), "yyyy-MM-dd");
}

/** Hora local "HH:mm" de un instante. */
export function horaLocal(fecha: Date, zona = ZONA_POR_DEFECTO): string {
  return format(enZona(fecha, zona), "HH:mm");
}

/** Día de semana local: 0 = domingo … 6 = sábado. */
export function diaSemanaLocal(fecha: Date, zona = ZONA_POR_DEFECTO): number {
  return enZona(fecha, zona).getDay();
}

/** Suma días a un día local "yyyy-MM-dd". */
export function sumarDias(dia: string, dias: number): string {
  const [anio, mes, d] = dia.split("-").map(Number);
  return format(addDays(new Date(anio, mes - 1, d), dias), "yyyy-MM-dd");
}

/** Para mostrar: "lunes 3 de noviembre". */
export function formatearDia(fecha: Date, zona = ZONA_POR_DEFECTO): string {
  return format(enZona(fecha, zona), "EEEE d 'de' MMMM", { locale: es });
}

/** Para mostrar: "03/11/2026 17:30". */
export function formatearFechaHora(fecha: Date, zona = ZONA_POR_DEFECTO): string {
  return format(enZona(fecha, zona), "dd/MM/yyyy HH:mm");
}

/** Para elegir el día: "hoy", "mañana" o "jueves 6 de noviembre". */
export function describirDia(dia: string, hoy: string): string {
  if (dia === hoy) return "hoy";
  if (dia === sumarDias(hoy, 1)) return "mañana";
  const [anio, mes, d] = dia.split("-").map(Number);
  return format(new Date(anio, mes - 1, d), "EEEE d 'de' MMMM", { locale: es });
}

/** Día corto para botones: { semana: "jue", numero: "6", mes: "nov" }. */
export function partesDelDia(dia: string): { semana: string; numero: string; mes: string } {
  const [anio, mes, d] = dia.split("-").map(Number);
  const fecha = new Date(anio, mes - 1, d);
  return {
    semana: format(fecha, "EEE", { locale: es }).replace(".", ""),
    numero: String(d),
    mes: format(fecha, "MMM", { locale: es }).replace(".", ""),
  };
}

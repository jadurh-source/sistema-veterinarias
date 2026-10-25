import { formatearDia, horaLocal } from "@/lib/fechas";

// Mensajes de WhatsApp que arma el panel. En la v1 se abre el chat con el texto listo;
// el envío lo hace la persona (docs/01-vision.md).

/** "Juan Pérez" → "Juan" */
const primerNombre = (nombre: string) => nombre.trim().split(/\s+/)[0];

export function mensajeConfirmacion(datos: {
  cliente: string;
  mascota: string;
  servicio: string;
  inicio: Date;
  veterinaria: string;
  zona: string;
}): string {
  return (
    `¡Hola ${primerNombre(datos.cliente)}! Te confirmamos el turno de ${datos.mascota} para ${datos.servicio} ` +
    `el ${formatearDia(datos.inicio, datos.zona)} a las ${horaLocal(datos.inicio, datos.zona)} en ${datos.veterinaria}. ¡Te esperamos! 🐾`
  );
}

// El cliente se identifica por su WhatsApp normalizado (docs/04, sección 5).
// Formato guardado: +549 + código de área sin 0 + número sin 15 (10 dígitos). Ej.: +5493815551234

/**
 * Acepta lo que la gente suele escribir: "381 555-1234", "0381 15 555 1234",
 * "+54 9 381 555 1234". Devuelve null si no se puede interpretar con seguridad.
 */
export function normalizarTelefono(entrada: string): string | null {
  let d = entrada.replace(/\D/g, "");
  if (d.startsWith("00")) d = d.slice(2);
  if (d.startsWith("54")) {
    d = d.slice(2);
    if (d.startsWith("9")) d = d.slice(1);
  }
  if (d.startsWith("0")) d = d.slice(1);

  // Con el 15 quedan 12 dígitos: se saca si aparece una sola vez después de un código de área (2 a 4 dígitos)
  if (d.length === 12) {
    const posiciones = [2, 3, 4].filter((p) => d.slice(p, p + 2) === "15");
    if (posiciones.length !== 1) return null;
    d = d.slice(0, posiciones[0]) + d.slice(posiciones[0] + 2);
  }

  return d.length === 10 ? `+549${d}` : null;
}

/** Para comparar nombres de mascotas: sin mayúsculas, acentos ni espacios de más. */
export function normalizarNombre(nombre: string): string {
  return nombre
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

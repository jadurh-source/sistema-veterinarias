// Enlaces de contacto del sitio público.

/** Abre el chat de WhatsApp (número en formato +549…) con un mensaje opcional ya escrito. */
export function enlaceWhatsapp(numero: string, mensaje?: string): string {
  const digitos = numero.replace(/\D/g, "");
  return `https://wa.me/${digitos}${mensaje ? `?text=${encodeURIComponent(mensaje)}` : ""}`;
}

/** Búsqueda de la dirección en Google Maps (enlace externo, sin mapa embebido). */
export function enlaceMapa(direccion: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(direccion)}`;
}

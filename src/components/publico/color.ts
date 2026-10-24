const COLOR_POR_DEFECTO = "#1f6b5a";

/** El color va dentro de un style: solo se acepta un hex válido. */
export function colorSeguro(color: string): string {
  return /^#[0-9a-f]{6}$/i.test(color) ? color : COLOR_POR_DEFECTO;
}

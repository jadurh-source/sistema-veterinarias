import type { Prisma } from "@prisma/client";

const formato = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

/** Formato de pesos para mostrar: "$ 18.000", "$ 1.250,50". */
export function formatearPesos(monto: Prisma.Decimal | number | string): string {
  // Intl separa el signo con un espacio duro; se usa un espacio común
  return formato.format(Number(monto.toString())).replace(/ /g, " ");
}

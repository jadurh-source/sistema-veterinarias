import { cacheLife, cacheTag } from "next/cache";
import type { CategoriaServicio, EspecieServicio, TipoProfesional } from "@prisma/client";
import { db } from "@/lib/db";
import type { Franja } from "@/lib/horarios";

// Datos públicos de la landing de una veterinaria. Se cachean por slug; cuando el
// panel cambie servicios, precios u horarios, se invalida con la etiqueta etiquetaLanding(slug).

export const etiquetaLanding = (slug: string) => `landing-${slug}`;

export type DatosLanding = {
  veterinaria: {
    slug: string;
    nombre: string;
    eslogan: string | null;
    colorPrimario: string;
    logoUrl: string | null;
    direccion: string | null;
    whatsapp: string;
    email: string | null;
  };
  servicios: {
    id: string;
    nombre: string;
    categoria: CategoriaServicio;
    descripcion: string | null;
    especie: EspecieServicio;
    duracionMin: number;
    precio: string; // Decimal serializado: el caché solo guarda datos planos
  }[];
  profesionales: { id: string; nombre: string; tipo: TipoProfesional; categorias: CategoriaServicio[] }[];
  horarios: Franja[];
};

export async function datosLanding(slug: string): Promise<DatosLanding | null> {
  "use cache";
  cacheTag(etiquetaLanding(slug));
  cacheLife("hours");

  const vet = await db.veterinaria.findFirst({
    where: { slug, activa: true },
    include: {
      servicios: { where: { activo: true, visibleWeb: true }, orderBy: [{ orden: "asc" }, { nombre: "asc" }] },
      profesionales: { where: { activo: true }, orderBy: { nombre: "asc" } },
      horarios: { where: { profesionalId: null } },
    },
  });
  if (!vet) return null;

  return {
    veterinaria: {
      slug: vet.slug,
      nombre: vet.nombre,
      eslogan: vet.eslogan,
      colorPrimario: vet.colorPrimario,
      logoUrl: vet.logoUrl,
      direccion: vet.direccion,
      whatsapp: vet.whatsapp,
      email: vet.email,
    },
    servicios: vet.servicios.map((s) => ({
      id: s.id,
      nombre: s.nombre,
      categoria: s.categoria,
      descripcion: s.descripcion,
      especie: s.especie,
      duracionMin: s.duracionMin,
      precio: s.precio.toString(),
    })),
    profesionales: vet.profesionales.map(({ id, nombre, tipo, categorias }) => ({ id, nombre, tipo, categorias })),
    horarios: vet.horarios.map(({ diaSemana, desde, hasta }) => ({ diaSemana, desde, hasta })),
  };
}

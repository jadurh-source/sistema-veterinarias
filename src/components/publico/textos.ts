import type { CategoriaServicio, EspecieServicio, TipoProfesional } from "@prisma/client";

export const NOMBRE_CATEGORIA: Record<CategoriaServicio, string> = {
  CLINICA: "Clínica",
  PREVENCION: "Prevención",
  ESTETICA: "Estética",
  CIRUGIA: "Cirugía",
  DIAGNOSTICO: "Diagnóstico",
};

// Orden en que se muestran las categorías en la landing
export const ORDEN_CATEGORIAS: CategoriaServicio[] = ["CLINICA", "PREVENCION", "ESTETICA", "CIRUGIA", "DIAGNOSTICO"];

export const TEXTO_ESPECIE: Record<EspecieServicio, string | null> = {
  PERRO: "Solo perros",
  GATO: "Solo gatos",
  TODAS: null,
};

export const NOMBRE_TIPO: Record<TipoProfesional, string> = {
  VETERINARIO: "Medicina veterinaria",
  PELUQUERO: "Peluquería y estética",
};

import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { Rol } from "@prisma/client";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// La veterinaria actual sale siempre de acá: de la sesión en el panel o del slug
// en el sitio público. Nunca de un veterinariaId que mande el navegador.

export type UsuarioActual = {
  id: string;
  nombre: string;
  email: string;
  rol: Rol;
  veterinariaId: string;
};

/** Usuario logueado, o null. Se lee una sola vez por pedido. */
export const obtenerUsuario = cache(async (): Promise<UsuarioActual | null> => {
  const sesion = await auth.api.getSession({ headers: await headers() });
  if (!sesion) return null;
  const { id, name, email, rol, veterinariaId } = sesion.user;
  return { id, nombre: name, email, rol: rol as Rol, veterinariaId };
});

/** Para páginas del panel: exige sesión y, si se indican, alguno de los roles. */
export async function exigirUsuario(...roles: Rol[]): Promise<UsuarioActual> {
  const usuario = await obtenerUsuario();
  if (!usuario) redirect("/ingresar");
  if (roles.length > 0 && !roles.includes(usuario.rol)) redirect("/panel/agenda?sin-permiso=1");
  return usuario;
}

/** Veterinaria activa para el sitio público (/[slug]), o null si no existe. */
export async function veterinariaPorSlug(slug: string) {
  return db.veterinaria.findFirst({ where: { slug, activa: true } });
}

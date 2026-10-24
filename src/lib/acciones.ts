import type { Rol } from "@prisma/client";
import type { z } from "zod";
import { obtenerUsuario, type UsuarioActual } from "@/lib/tenant";

// Molde para las server actions de src/server/: valida la entrada con Zod, exige
// sesión y rol, y le pasa al código el usuario con su veterinariaId.

export type Resultado<T> = { ok: true; datos: T } | { ok: false; error: string };

export function accionProtegida<E extends z.ZodType, T>(
  opciones: { roles: Rol[]; esquema: E },
  ejecutar: (datos: z.infer<E>, usuario: UsuarioActual) => Promise<T>,
) {
  return async (entrada: unknown): Promise<Resultado<T>> => {
    const usuario = await obtenerUsuario();
    if (!usuario) return { ok: false, error: "Tu sesión venció. Volvé a ingresar." };
    if (!opciones.roles.includes(usuario.rol)) {
      return { ok: false, error: "No tenés permiso para hacer esto." };
    }

    const validacion = opciones.esquema.safeParse(entrada);
    if (!validacion.success) {
      return { ok: false, error: validacion.error.issues[0]?.message ?? "Revisá los datos cargados." };
    }

    return { ok: true, datos: await ejecutar(validacion.data, usuario) };
  };
}

import { beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";
import type { UsuarioActual } from "./tenant";

const usuarioActual = vi.hoisted(() => ({ valor: null as UsuarioActual | null }));
vi.mock("@/lib/tenant", () => ({ obtenerUsuario: async () => usuarioActual.valor }));

const { accionProtegida } = await import("./acciones");

const recepcion: UsuarioActual = { id: "u1", nombre: "Carla", email: "r@demo.com", rol: "RECEPCION", veterinariaId: "vet-1" };

const soloDueno = accionProtegida(
  { roles: ["DUENO"], esquema: z.object({ porcentaje: z.number().min(1, "El porcentaje tiene que ser mayor a 0.") }) },
  async (datos, usuario) => ({ ...datos, veterinariaId: usuario.veterinariaId }),
);

describe("accionProtegida", () => {
  beforeEach(() => {
    usuarioActual.valor = null;
  });

  it("rechaza si no hay sesión", async () => {
    expect(await soloDueno({ porcentaje: 10 })).toEqual({ ok: false, error: "Tu sesión venció. Volvé a ingresar." });
  });

  it("rechaza si el rol no está permitido", async () => {
    usuarioActual.valor = recepcion;
    expect(await soloDueno({ porcentaje: 10 })).toEqual({ ok: false, error: "No tenés permiso para hacer esto." });
  });

  it("rechaza datos inválidos con el mensaje del esquema", async () => {
    usuarioActual.valor = { ...recepcion, rol: "DUENO" };
    expect(await soloDueno({ porcentaje: 0 })).toEqual({ ok: false, error: "El porcentaje tiene que ser mayor a 0." });
  });

  it("ejecuta con la veterinaria de la sesión, no con la que mande el navegador", async () => {
    usuarioActual.valor = { ...recepcion, rol: "DUENO" };
    const resultado = await soloDueno({ porcentaje: 10, veterinariaId: "otra-vet" });
    expect(resultado).toEqual({ ok: true, datos: { porcentaje: 10, veterinariaId: "vet-1" } });
  });
});

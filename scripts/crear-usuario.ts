// Crea un usuario del panel (o le cambia la contraseña si ya existe).
// Uso: CONTRASENA='...' npm run crear-usuario -- <slug> <email> <rol DUENO|RECEPCION> "<nombre>"
// La contraseña va por variable de entorno para que no quede en el historial de comandos.
// Se ejecuta con Node (sin compilar).

import { PrismaClient } from "@prisma/client";
import { hashPassword } from "better-auth/crypto";

const [slug, emailCrudo, rol, nombre] = process.argv.slice(2);
const contrasena = process.env.CONTRASENA ?? "";
const email = (emailCrudo ?? "").trim().toLowerCase();

if (!slug || !email.includes("@") || (rol !== "DUENO" && rol !== "RECEPCION") || !nombre) {
  console.error('Uso: CONTRASENA=\'...\' npm run crear-usuario -- <slug> <email> <DUENO|RECEPCION> "<nombre>"');
  process.exit(1);
}
if (contrasena.length < 8) {
  console.error("La contraseña tiene que tener al menos 8 caracteres (variable CONTRASENA).");
  process.exit(1);
}

const db = new PrismaClient();

try {
  const vet = await db.veterinaria.findUnique({ where: { slug } });
  if (!vet) throw new Error(`No existe la veterinaria "${slug}".`);

  const existente = await db.usuario.findUnique({ where: { email } });
  if (existente && existente.veterinariaId !== vet.id) {
    throw new Error(`${email} ya es usuario de otra veterinaria.`);
  }

  const usuario = existente
    ? await db.usuario.update({ where: { id: existente.id }, data: { nombre, rol } })
    : await db.usuario.create({ data: { veterinariaId: vet.id, nombre, email, rol, emailVerificado: true } });

  const hash = await hashPassword(contrasena);
  const cuenta = await db.cuenta.findFirst({ where: { usuarioId: usuario.id, proveedorId: "credential" } });
  if (cuenta) {
    await db.cuenta.update({ where: { id: cuenta.id }, data: { contrasena: hash } });
  } else {
    await db.cuenta.create({
      data: { id: crypto.randomUUID(), usuarioId: usuario.id, cuentaId: usuario.id, proveedorId: "credential", contrasena: hash },
    });
  }

  console.log(`${existente ? "Actualizado" : "Creado"}: ${email} · ${rol} · ${vet.nombre}`);
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  await db.$disconnect();
}

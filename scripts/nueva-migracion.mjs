// Crea y aplica una migración comparando la base local con schema.prisma.
// Reemplaza a `prisma migrate dev`, que con `prisma dev` falla por la base sombra
// ("type ... already exists"). Uso: npm run migracion -- nombre_de_la_migracion
import { execSync } from "node:child_process";
import { mkdirSync, readFileSync, rmSync } from "node:fs";

const nombre = process.argv[2];
if (!nombre || !/^[a-z0-9_]+$/.test(nombre)) {
  console.error("Indicá un nombre en minúsculas y con guiones bajos: npm run migracion -- agregar_campo");
  process.exit(1);
}

const fecha = new Date().toISOString().replace(/\D/g, "").slice(0, 14);
const carpeta = `prisma/migrations/${fecha}_${nombre}`;
const archivo = `${carpeta}/migration.sql`;
const correr = (comando) => execSync(comando, { stdio: "inherit" });

mkdirSync(carpeta, { recursive: true });
correr(
  `npx prisma migrate diff --from-schema-datasource prisma/schema.prisma --to-schema-datamodel prisma/schema.prisma --script -o ${archivo}`,
);

if (!readFileSync(archivo, "utf8").match(/^(CREATE|ALTER|DROP)/m)) {
  rmSync(carpeta, { recursive: true });
  console.log("No hay cambios en el schema: no se creó ninguna migración.");
  process.exit(0);
}

correr("npx prisma migrate deploy");
correr("npx prisma generate");
console.log(`Migración creada y aplicada: ${archivo}`);

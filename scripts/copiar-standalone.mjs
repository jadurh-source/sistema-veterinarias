// El servidor standalone no incluye public/ ni .next/static: se copian después del build.
// Se usa Node en lugar de `cp` para que funcione igual en Windows y en Railway.
import { cpSync, existsSync } from "node:fs";

const destino = ".next/standalone";

if (!existsSync(destino)) {
  console.error("No existe .next/standalone. Revisá output: \"standalone\" en next.config.ts.");
  process.exit(1);
}

// public/ puede no existir: Git no guarda carpetas vacías
if (existsSync("public")) {
  cpSync("public", `${destino}/public`, { recursive: true });
}
cpSync(".next/static", `${destino}/.next/static`, { recursive: true });
console.log("Archivos estáticos copiados a .next/standalone");

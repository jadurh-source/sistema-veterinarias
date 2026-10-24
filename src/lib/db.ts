import { PrismaClient } from "@prisma/client";

// Cliente Prisma único. En desarrollo se guarda en globalThis para que la recarga
// en caliente no abra una conexión nueva cada vez (prisma dev admite una sola).
const globalParaPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db = globalParaPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalParaPrisma.prisma = db;
}

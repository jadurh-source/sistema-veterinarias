import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/lib/db";

// Login del panel con email y contraseña. Los nombres de campo de Better Auth
// se mapean a los del modelo en español (prisma/schema.prisma).
export const auth = betterAuth({
  database: prismaAdapter(db, { provider: "postgresql" }),
  emailAndPassword: {
    enabled: true,
    // Los usuarios los da de alta el dueño o el script de alta, no hay registro público
    disableSignUp: true,
    minPasswordLength: 8,
  },
  session: {
    modelName: "sesion",
    expiresIn: 60 * 60 * 24 * 7, // 7 días
    updateAge: 60 * 60 * 24, // se renueva una vez por día de uso
    fields: {
      userId: "usuarioId",
      expiresAt: "expiraEn",
      ipAddress: "ip",
      userAgent: "agenteUsuario",
      createdAt: "creadoEn",
      updatedAt: "actualizadoEn",
    },
  },
  user: {
    modelName: "usuario",
    fields: {
      name: "nombre",
      emailVerified: "emailVerificado",
      image: "imagen",
      createdAt: "creadoEn",
      updatedAt: "actualizadoEn",
    },
    additionalFields: {
      // input: false → nunca se toman del navegador
      rol: { type: "string", required: true, input: false },
      veterinariaId: { type: "string", required: true, input: false },
    },
  },
  account: {
    modelName: "cuenta",
    fields: {
      userId: "usuarioId",
      accountId: "cuentaId",
      providerId: "proveedorId",
      password: "contrasena",
      accessToken: "tokenAcceso",
      refreshToken: "tokenRefresco",
      idToken: "tokenId",
      accessTokenExpiresAt: "tokenAccesoExpiraEn",
      refreshTokenExpiresAt: "tokenRefrescoExpiraEn",
      scope: "alcance",
      createdAt: "creadoEn",
      updatedAt: "actualizadoEn",
    },
  },
  verification: {
    modelName: "verificacion",
    fields: {
      identifier: "identificador",
      value: "valor",
      expiresAt: "expiraEn",
      createdAt: "creadoEn",
      updatedAt: "actualizadoEn",
    },
  },
  // Permite que las server actions guarden la cookie de sesión
  plugins: [nextCookies()],
});

import { createAuthClient } from "better-auth/react";

// Cliente de Better Auth para el navegador. Habla con /api/auth, que aplica el
// límite de intentos de login (las llamadas internas desde el servidor no lo tienen).
export const authCliente = createAuthClient();

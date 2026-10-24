import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

// Chequeo rápido: sin cookie de sesión no se entra al panel. La verificación real
// (sesión vigente y rol) la hace cada página y cada acción con lib/tenant.ts.
export function proxy(request: NextRequest) {
  if (!getSessionCookie(request)) {
    return NextResponse.redirect(new URL("/ingresar", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/panel/:path*"],
};

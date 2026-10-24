"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authCliente } from "@/lib/auth-cliente";

export function FormularioIngreso() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function ingresar(formData: FormData) {
    setError(null);
    setEnviando(true);
    const { error } = await authCliente.signIn.email({
      email: String(formData.get("email") ?? "").trim(),
      password: String(formData.get("contrasena") ?? ""),
    });
    setEnviando(false);

    if (error) {
      setError(
        error.status === 429
          ? "Demasiados intentos. Esperá unos segundos y probá de nuevo."
          : "El email o la contraseña no son correctos.",
      );
      return;
    }
    router.replace("/panel/agenda");
    router.refresh();
  }

  return (
    <form action={ingresar} className="mt-6 flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm font-medium text-zinc-800">
        Email
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          className="rounded-lg border border-zinc-300 px-3 py-2.5 text-base font-normal outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/20"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium text-zinc-800">
        Contraseña
        <input
          name="contrasena"
          type="password"
          required
          autoComplete="current-password"
          className="rounded-lg border border-zinc-300 px-3 py-2.5 text-base font-normal outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/20"
        />
      </label>
      {error && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={enviando}
        className="rounded-lg bg-emerald-800 px-4 py-2.5 font-medium text-white hover:bg-emerald-900 disabled:opacity-60"
      >
        {enviando ? "Ingresando…" : "Ingresar"}
      </button>
    </form>
  );
}

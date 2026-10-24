import type { Metadata } from "next";
import { Suspense } from "react";
import { Navegacion } from "@/components/panel/navegacion";

export const metadata: Metadata = { title: "Panel" };

export default function LayoutPanel({ children }: LayoutProps<"/panel">) {
  return (
    <div className="flex flex-1 flex-col bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:gap-6">
          <span className="font-semibold text-emerald-900">Panel</span>
          {/* La navegación depende del rol: se lee la sesión y llega en streaming */}
          <Suspense fallback={<div className="h-9" />}>
            <Navegacion />
          </Suspense>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">{children}</main>
    </div>
  );
}

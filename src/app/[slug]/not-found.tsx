import { IconoHuella } from "@/components/publico/iconos";

export default function VeterinariaNoEncontrada() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-3 px-4 py-24 text-center">
      <IconoHuella className="size-14 text-zinc-300" />
      <h1 className="font-titulos text-4xl font-extrabold uppercase text-zinc-800">No encontramos esta veterinaria</h1>
      <p className="max-w-md text-zinc-600">
        Revisá que la dirección esté bien escrita. Si te pasaron el enlace, pedile a la veterinaria que te lo vuelva a mandar.
      </p>
    </main>
  );
}

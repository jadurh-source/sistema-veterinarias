import Image from "next/image";
import fotoPerro from "../../../public/fotos/cachorro.jpg";
import fotoGato from "../../../public/fotos/gato.jpg";
import fotoOtras from "../../../public/fotos/perro-y-gato.jpg";

const MASCOTAS = [
  { nombre: "Perros", foto: fotoPerro, alt: "Cachorro de corgi" },
  { nombre: "Gatos", foto: fotoGato, alt: "Gato blanco y negro" },
  { nombre: "Y más", foto: fotoOtras, alt: "Un perro y un gato abrazados" },
];

export function Mascotas() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <h2 className="text-center font-titulos text-3xl font-extrabold uppercase text-marca-oscuro">Atendemos a tu compañero</h2>
      <ul className="mt-6 flex justify-center gap-6 sm:gap-12">
        {MASCOTAS.map((m) => (
          <li key={m.nombre} className="flex flex-col items-center gap-2">
            <Image
              src={m.foto}
              alt={m.alt}
              placeholder="blur"
              sizes="128px"
              className="size-24 rounded-full object-cover ring-4 ring-marca-suave sm:size-32"
            />
            <span className="font-semibold text-zinc-800">{m.nombre}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

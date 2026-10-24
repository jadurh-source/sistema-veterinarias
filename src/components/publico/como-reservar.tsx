import Image from "next/image";
import Link from "next/link";
import fotoPerros from "../../../public/fotos/perros-corriendo.jpg";

const PASOS = [
  { titulo: "Elegí el servicio", texto: "Consulta, vacunas, baño y corte, estudios… con su precio a la vista." },
  { titulo: "Elegí el día y el horario", texto: "Te mostramos solo los horarios libres de los próximos días." },
  { titulo: "Dejanos tus datos", texto: "Tu nombre, tu WhatsApp y el de tu mascota. Sin crear cuenta ni contraseña." },
];

export function ComoReservar({ slug }: { slug: string }) {
  return (
    <section id="como-reservar" className="scroll-mt-20 py-16">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 md:grid-cols-2">
        <Image
          src={fotoPerros}
          alt="Dos perros corriendo felices"
          placeholder="blur"
          sizes="(min-width: 768px) 50vw, 100vw"
          className="order-last aspect-[4/3] w-full rounded-[2.5rem] object-cover md:order-first"
        />
        <div>
          <h2 className="font-titulos text-4xl font-extrabold uppercase text-marca-oscuro sm:text-5xl">Reservar es fácil</h2>
          <ol className="mt-6 flex flex-col gap-5">
            {PASOS.map((paso, i) => (
              <li key={paso.titulo} className="flex gap-4">
                <span className="grid size-12 shrink-0 place-items-center rounded-full bg-marca font-titulos text-2xl font-extrabold text-white">
                  {i + 1}
                </span>
                <div>
                  <h3 className="text-lg font-semibold text-zinc-900">{paso.titulo}</h3>
                  <p className="text-zinc-600">{paso.texto}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="mt-5 rounded-2xl bg-marca-claro px-4 py-3 text-sm text-zinc-700">
            Listo: te confirmamos el turno por WhatsApp.
          </p>
          <Link
            href={`/${slug}/reservar`}
            className="mt-6 inline-block rounded-full bg-marca px-7 py-3.5 font-semibold text-white hover:bg-marca-oscuro"
          >
            Reservá tu turno
          </Link>
        </div>
      </div>
    </section>
  );
}

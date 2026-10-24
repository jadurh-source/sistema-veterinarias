import type { CategoriaServicio } from "@prisma/client";

// Íconos de trazo simples, dibujados a mano para no sumar una librería.
type Props = { className?: string };

function Svg({ className = "size-6", children }: Props & { children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      {children}
    </svg>
  );
}

export function IconoHuella(props: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={props.className ?? "size-6"} aria-hidden="true">
      <ellipse cx="6" cy="9.5" rx="2" ry="2.6" />
      <ellipse cx="10" cy="5.6" rx="2" ry="2.6" />
      <ellipse cx="14" cy="5.6" rx="2" ry="2.6" />
      <ellipse cx="18" cy="9.5" rx="2" ry="2.6" />
      <path d="M12 11c-2.6 0-5.6 3.7-5.6 6.3 0 1.6 1.2 2.4 2.6 2.4 1.2 0 2-.6 3-.6s1.8.6 3 .6c1.4 0 2.6-.8 2.6-2.4C17.6 14.7 14.6 11 12 11Z" />
    </svg>
  );
}

export function IconoWhatsapp(props: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={props.className ?? "size-6"} aria-hidden="true">
      <path d="M12 2.2A9.7 9.7 0 0 0 3.6 16.8L2.3 21.7l5-1.3A9.7 9.7 0 1 0 12 2.2Zm0 17.7a8 8 0 0 1-4.1-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8 8 0 1 1 12 19.9Zm4.4-6c-.2-.1-1.4-.7-1.7-.8-.2-.1-.4-.1-.5.1l-.8.9c-.1.2-.3.2-.5.1a6.5 6.5 0 0 1-3.2-2.8c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.5-.4h-.5a.9.9 0 0 0-.7.3 2.8 2.8 0 0 0-.9 2.1 4.9 4.9 0 0 0 1 2.6 11.2 11.2 0 0 0 4.3 3.8c1.6.7 2.2.7 3 .6.5-.1 1.4-.6 1.6-1.1.2-.6.2-1 .1-1.1l-.4-.2Z" />
    </svg>
  );
}

export function IconoReloj(props: Props) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </Svg>
  );
}

export function IconoUbicacion(props: Props) {
  return (
    <Svg {...props}>
      <path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21Z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </Svg>
  );
}

export function IconoEmail(props: Props) {
  return (
    <Svg {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m4 7 8 6 8-6" />
    </Svg>
  );
}

export function IconoCalendario(props: Props) {
  return (
    <Svg {...props}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </Svg>
  );
}

export function IconoCheck(props: Props) {
  return (
    <Svg {...props}>
      <path d="m5 12 4.5 4.5L19 7" />
    </Svg>
  );
}

const ICONO_CATEGORIA: Record<CategoriaServicio, React.ReactNode> = {
  // Estetoscopio
  CLINICA: (
    <>
      <path d="M6 3v5a4 4 0 0 0 8 0V3" />
      <path d="M10 12v3a5 5 0 0 0 10 0v-2" />
      <circle cx="20" cy="11" r="2" />
    </>
  ),
  // Escudo con cruz
  PREVENCION: (
    <>
      <path d="M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V6l-7-3Z" />
      <path d="M12 9v6M9 12h6" />
    </>
  ),
  // Tijera
  ESTETICA: (
    <>
      <circle cx="6" cy="7" r="2.5" />
      <circle cx="6" cy="17" r="2.5" />
      <path d="M8.2 8.3 20 18M8.2 15.7 20 6" />
    </>
  ),
  // Cruz médica
  CIRUGIA: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="4" />
      <path d="M12 8v8M8 12h8" />
    </>
  ),
  // Lupa
  DIAGNOSTICO: (
    <>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m20 20-4.8-4.8M8 10.5h5M10.5 8v5" />
    </>
  ),
};

export function IconoCategoria({ categoria, className }: Props & { categoria: CategoriaServicio }) {
  return <Svg className={className}>{ICONO_CATEGORIA[categoria]}</Svg>;
}

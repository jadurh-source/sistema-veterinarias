import { SeccionPendiente } from "@/components/panel/seccion-pendiente";

export default function Configuracion() {
  return <SeccionPendiente titulo="Configuración" etapa={3} roles={["DUENO"]} />;
}

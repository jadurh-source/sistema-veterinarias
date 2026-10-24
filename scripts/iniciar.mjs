// Arranca el servidor standalone. En contenedores HOSTNAME suele traer el nombre
// del contenedor, y Next escucharía solo ahí: se fuerza 0.0.0.0. PORT lo pone Railway.
process.env.HOSTNAME = "0.0.0.0";

await import("../.next/standalone/server.js");

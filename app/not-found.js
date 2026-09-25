import Link from "next/link";
import EstadoMarca from "../components/EstadoMarca";

// 404 con la marca. Next agrega <meta name="robots" content="noindex"> solo.
export const metadata = {
  title: "Página no encontrada · Muzzaga Pádel",
};

export default function NotFound() {
  return (
    <>
      <EstadoMarca
        pose="enredado-paleta"
        kicker="Error 404"
        title="Se nos enredó la paleta"
        text="La página que buscás no existe o cambió de lugar."
      >
        <Link href="/" className="btn btn-orange-primary">
          Ir al inicio
        </Link>
        <Link href="/#turnos" className="btn btn-secondary">
          Reservar turno
        </Link>
      </EstadoMarca>
    </>
  );
}

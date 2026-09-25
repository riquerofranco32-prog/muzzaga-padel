"use client";

import { useEffect } from "react";
import Link from "next/link";
import EstadoMarca from "../components/EstadoMarca";
import { CLUB_INFO } from "../data/club";

// Error de una página, con la marca. En Next 16 el error boundary recibe
// `retry` (vuelve a pedir y dibujar la página) en vez de `reset`.
export default function Error({ error, retry }) {
  useEffect(() => {
    console.error(error);
    // Un error boundary es de cliente y no admite `metadata`.
    document.title = "Algo falló · Muzzaga Pádel";
  }, [error]);

  return (
    <>
      <EstadoMarca
        pose="golpe-pelota"
        kicker="Error"
        title="Pelota afuera"
        text="Algo falló de nuestro lado. Probá de nuevo en un rato o escribinos por WhatsApp."
      >
        <button type="button" className="btn btn-orange-primary" onClick={() => retry()}>
          Reintentar
        </button>
        <Link href="/" className="btn btn-secondary">
          Ir al inicio
        </Link>
        <a
          href={`https://wa.me/${CLUB_INFO.phoneRaw}`}
          target="_blank"
          rel="noopener"
          className="btn btn-secondary-whatsapp"
        >
          Escribir por WhatsApp
        </a>
      </EstadoMarca>
    </>
  );
}

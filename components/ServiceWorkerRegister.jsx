"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      process.env.NODE_ENV === "production"
    ) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          // Registrado exitosamente
        })
        .catch(() => {
          // Silencioso en caso de bloqueo o modo incógnito
        });
    }
  }, []);

  return null;
}

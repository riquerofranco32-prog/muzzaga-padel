"use client";

import { useState } from "react";
import Link from "next/link";
import { ExternalLink, LogOut, MoreHorizontal, Plus, Tv } from "lucide-react";
import { ICON_PROPS, MOBILE_PRIMARY_IDS, NAV_ITEMS } from "../nav";

/**
 * Mobile (<768px): bottom nav con 4 secciones + "Más", y "Nueva Reserva"
 * como FAB. En desktop no se renderiza nada visible (CSS).
 */
export default function MobileNav({
  view,
  onNavigate,
  onNewBooking,
  onLogout,
}) {
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const primary = MOBILE_PRIMARY_IDS.map((id) =>
    NAV_ITEMS.find((n) => n.id === id),
  );
  const secondary = NAV_ITEMS.filter((n) => !MOBILE_PRIMARY_IDS.includes(n.id));
  const isSecondaryActive = secondary.some((n) => n.id === view);

  function go(id) {
    setIsMoreOpen(false);
    onNavigate(id);
  }

  return (
    <>
      <button
        type="button"
        className="admin-fab"
        onClick={onNewBooking}
        aria-label="Nueva reserva"
      >
        <Plus size={24} strokeWidth={2} aria-hidden />
      </button>

      <nav className="admin-bottom-nav" aria-label="Secciones">
        {primary.map(({ id, label, shortLabel, icon: Icon }) => (
          <button
            key={id}
            type="button"
            aria-current={view === id ? "page" : undefined}
            onClick={() => go(id)}
          >
            <Icon {...ICON_PROPS} />
            {shortLabel || label}
          </button>
        ))}
        <button
          type="button"
          aria-current={isSecondaryActive ? "page" : undefined}
          aria-expanded={isMoreOpen}
          onClick={() => setIsMoreOpen(true)}
        >
          <MoreHorizontal {...ICON_PROPS} />
          Más
        </button>
      </nav>

      {isMoreOpen && (
        <div
          className="admin-sheet-backdrop"
          onClick={() => setIsMoreOpen(false)}
        >
          <div
            className="admin-sheet"
            role="dialog"
            aria-modal="true"
            aria-label="Más secciones"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-sheet-handle" />
            {secondary.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                aria-current={view === id ? "page" : undefined}
                onClick={() => go(id)}
              >
                <Icon {...ICON_PROPS} />
                {label}
              </button>
            ))}
            <Link href="/admin/monitor" target="_blank">
              <Tv {...ICON_PROPS} />
              Monitor TV Pistas
            </Link>
            <Link href="/" target="_blank">
              <ExternalLink {...ICON_PROPS} />
              Ver web
            </Link>
            <button type="button" onClick={onLogout}>
              <LogOut {...ICON_PROPS} />
              Salir
            </button>
          </div>
        </div>
      )}
    </>
  );
}

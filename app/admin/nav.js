// Secciones del admin. Una sola lista para el sidebar, la bottom nav de
// mobile y el command palette, así nunca se desincronizan.
import {
  BarChart3,
  Calendar,
  CalendarDays,
  Settings,
  Trophy,
  Users,
  UtensilsCrossed,
  Wallet,
} from "lucide-react";

export const NAV_ITEMS = [
  { id: "agenda", label: "Agenda", icon: CalendarDays },
  { id: "calendario", label: "Calendario", icon: Calendar },
  { id: "clientes", label: "Clientes", icon: Users },
  { id: "caja", label: "Caja & Cierre Z", shortLabel: "Caja", icon: Wallet },
  { id: "cantina", label: "Cantina", icon: UtensilsCrossed },
  { id: "torneos", label: "Torneos", icon: Trophy },
  { id: "reportes", label: "Reportes", icon: BarChart3 },
  { id: "configuracion", label: "Configuración", icon: Settings },
];

/** Las 4 fijas de la bottom nav; el resto va en "Más". */
export const MOBILE_PRIMARY_IDS = ["agenda", "calendario", "cantina", "caja"];

export const ICON_PROPS = { size: 18, strokeWidth: 1.75, "aria-hidden": true };

export function findNavItem(id) {
  return NAV_ITEMS.find((item) => item.id === id) || NAV_ITEMS[0];
}

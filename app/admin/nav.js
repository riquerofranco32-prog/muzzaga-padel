// Secciones del admin. Una sola lista para el sidebar, la bottom nav de
// mobile y el command palette, así nunca se desincronizan.
import {
  BarChart3,
  Calendar,
  CalendarDays,
  History,
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
  { id: "caja", label: "Caja del día", shortLabel: "Caja", icon: Wallet },
  { id: "cantina", label: "Cantina", icon: UtensilsCrossed },
  { id: "torneos", label: "Torneos", icon: Trophy },
  { id: "reportes", label: "Números del mes", shortLabel: "Números", icon: BarChart3 },
  { id: "configuracion", label: "Ajustes del club", shortLabel: "Ajustes", icon: Settings },
  { id: "actividad", label: "Quién hizo qué", shortLabel: "Movimientos", icon: History },
];

// Ordenado por uso: arriba lo de todos los días.
export const NAV_GROUPS = [
  {
    title: "Todos los días",
    items: [
      { id: "agenda", label: "Agenda de hoy", icon: CalendarDays },
      { id: "caja", label: "Caja del día", icon: Wallet },
      { id: "cantina", label: "Cantina", icon: UtensilsCrossed },
    ],
  },
  {
    title: "El club",
    items: [
      { id: "calendario", label: "Calendario", icon: Calendar },
      { id: "clientes", label: "Clientes", icon: Users },
      { id: "torneos", label: "Torneos", icon: Trophy },
    ],
  },
  {
    title: "Números y ajustes",
    items: [
      { id: "reportes", label: "Números del mes", icon: BarChart3 },
      { id: "configuracion", label: "Ajustes del club", icon: Settings },
      { id: "actividad", label: "Quién hizo qué", icon: History },
    ],
  },
];

/** Las 4 fijas de la bottom nav; el resto va en "Más". */
export const MOBILE_PRIMARY_IDS = ["agenda", "caja", "cantina", "calendario"];

export const ICON_PROPS = { size: 18, strokeWidth: 1.75, "aria-hidden": true };

export function findNavItem(id) {
  return NAV_ITEMS.find((item) => item.id === id) || NAV_ITEMS[0];
}

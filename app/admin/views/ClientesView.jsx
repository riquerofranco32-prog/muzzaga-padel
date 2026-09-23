"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Download,
  Search,
  Send,
  Users,
  X,
} from "lucide-react";
import {
  formatARS,
  formatRelativeDays,
  normalizeSearch,
  plural,
} from "../../../lib/format";
import { formatPhoneAR, toWhatsappNumber } from "../../../lib/phone";
import { todayInClub } from "../../../lib/booking";
import {
  INACTIVE_AFTER_DAYS,
  categorizeClient,
  generateClientsCsv,
  isInactiveClient,
} from "../../../lib/clientsExport";
import { EmptyState, SkeletonRows } from "../ui/states";
import { WhatsAppMiniIcon } from "../adminHelpers";
import ClientDrawer, { initials } from "./clientes/ClientDrawer";

const SEARCH_DEBOUNCE_MS = 250;
const ICON = { size: 16, strokeWidth: 1.75, "aria-hidden": true };
const DEFAULT_INVITE =
  "¡Hola {nombre}! Hace rato no te vemos por Muzzaga Pádel 🎾 Tenemos turnos libres esta semana, ¿te guardamos uno?";

const SEGMENTS = [
  { id: "all", label: "Todos", test: () => true },
  { id: "vip", label: "VIP", test: (c) => c.count >= 4 },
  {
    id: "frecuente",
    label: "Frecuentes",
    test: (c) => c.count >= 2 && c.count < 4,
  },
  { id: "nuevo", label: "Nuevos", test: (c) => c.count === 1 },
  {
    id: "inactivo",
    label: `Inactivos (+${INACTIVE_AFTER_DAYS} días)`,
    test: (c, today) => isInactiveClient(c, today),
  },
];

const COLUMNS = [
  { id: "name", label: "Cliente", value: (c) => normalizeSearch(c.name) },
  { id: "count", label: "Turnos", value: (c) => c.count },
  { id: "totalSpent", label: "Total gastado", value: (c) => c.totalSpent || 0 },
  { id: "lastDate", label: "Último turno", value: (c) => c.lastDate || "" },
];

export default function ClientesView({
  clients = null,
  initialSearch = "",
  onToast,
}) {
  const [searchInput, setSearchInput] = useState(initialSearch);
  const [search, setSearch] = useState(initialSearch);
  const [segment, setSegment] = useState("all");
  const [sort, setSort] = useState({ by: "count", dir: "desc" });
  const [openClient, setOpenClient] = useState(null);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteText, setInviteText] = useState(DEFAULT_INVITE);
  const [invited, setInvited] = useState(() => new Set());
  const today = todayInClub();
  const list = clients || [];

  useEffect(() => {
    const id = setTimeout(() => setSearch(searchInput), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [searchInput]);

  const counts = useMemo(
    () =>
      Object.fromEntries(
        SEGMENTS.map((s) => [
          s.id,
          list.filter((c) => s.test(c, today)).length,
        ]),
      ),
    [list, today],
  );

  const visible = useMemo(() => {
    const seg = SEGMENTS.find((s) => s.id === segment);
    const q = normalizeSearch(search);
    const col = COLUMNS.find((c) => c.id === sort.by);
    return list
      .filter((c) => seg.test(c, today))
      .filter(
        (c) => !q || normalizeSearch(`${c.name} ${c.phone || ""}`).includes(q),
      )
      .sort((a, b) => {
        const va = col.value(a);
        const vb = col.value(b);
        const cmp = va < vb ? -1 : va > vb ? 1 : 0;
        return sort.dir === "asc" ? cmp : -cmp;
      });
  }, [list, segment, search, sort, today]);

  const inactiveWithPhone = list.filter(
    (c) => isInactiveClient(c, today) && c.phone,
  );

  function toggleSort(by) {
    setSort((s) =>
      s.by === by
        ? { by, dir: s.dir === "asc" ? "desc" : "asc" }
        : { by, dir: by === "name" ? "asc" : "desc" },
    );
  }

  function exportCsv() {
    const blob = new Blob([generateClientsCsv(visible)], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `clientes-muzzaga-${today}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const inviteLink = (c) =>
    `https://wa.me/${toWhatsappNumber(c.phone)}?text=${encodeURIComponent(
      inviteText.replaceAll("{nombre}", c.name.split(" ")[0]),
    )}`;

  if (!clients) {
    return <SkeletonRows count={8} height={52} />;
  }

  return (
    <div>
      <div className="admin-view-toolbar">
        <div
          className="admin-segmented"
          role="group"
          aria-label="Segmento de clientes"
        >
          {SEGMENTS.map((s) => (
            <button
              key={s.id}
              type="button"
              aria-pressed={segment === s.id}
              onClick={() => setSegment(s.id)}
            >
              {s.label} ({counts[s.id]})
            </button>
          ))}
        </div>
        <div className="admin-view-toolbar-actions">
          <div className="admin-search-wrap">
            <Search {...ICON} />
            <input
              type="search"
              className="admin-search-input"
              placeholder="Nombre o teléfono"
              aria-label="Buscar cliente"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            {searchInput && (
              <button
                type="button"
                className="admin-search-clear"
                onClick={() => setSearchInput("")}
                aria-label="Limpiar búsqueda"
              >
                <X size={14} strokeWidth={1.75} aria-hidden />
              </button>
            )}
          </div>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={exportCsv}
            disabled={visible.length === 0}
          >
            <Download {...ICON} /> CSV
          </button>
        </div>
      </div>

      {segment === "inactivo" && inactiveWithPhone.length > 0 && (
        <div className="admin-callout">
          <span>
            {plural(
              inactiveWithPhone.length,
              "cliente no juega",
              "clientes no juegan",
            )}{" "}
            hace más de {INACTIVE_AFTER_DAYS} días.
          </span>
          <button
            type="button"
            className="btn btn-linear-primary"
            onClick={() => setIsInviteOpen(true)}
          >
            <Send {...ICON} /> Invitar por WhatsApp
          </button>
        </div>
      )}

      <div className="admin-table-wrapper">
        <table className="admin-table admin-table-clickable">
          <thead>
            <tr>
              {COLUMNS.map((col) => (
                <th
                  key={col.id}
                  aria-sort={
                    sort.by === col.id
                      ? sort.dir === "asc"
                        ? "ascending"
                        : "descending"
                      : "none"
                  }
                >
                  <button
                    type="button"
                    className="admin-th-sort"
                    onClick={() => toggleSort(col.id)}
                  >
                    {col.label}
                    {sort.by === col.id &&
                      (sort.dir === "asc" ? (
                        <ArrowUp size={12} aria-hidden />
                      ) : (
                        <ArrowDown size={12} aria-hidden />
                      ))}
                  </button>
                </th>
              ))}
              <th>Contacto</th>
            </tr>
          </thead>
          <tbody>
            {visible.length > 0 ? (
              visible.map((c) => {
                const cat = categorizeClient(c.count);
                return (
                  <tr key={c.key} onClick={() => setOpenClient(c)}>
                    <td data-label="Cliente">
                      <button
                        type="button"
                        className="admin-client-cell"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenClient(c);
                        }}
                      >
                        <span className="admin-avatar" aria-hidden>
                          {initials(c.name)}
                        </span>
                        <span>
                          <strong>{c.name}</strong>
                          <span className="admin-cell-sub">
                            {c.phone ? formatPhoneAR(c.phone) : "Sin teléfono"}
                          </span>
                        </span>
                        {cat.category !== "Nuevo" && (
                          <span className="admin-tag">{cat.category}</span>
                        )}
                      </button>
                    </td>
                    <td data-label="Turnos">
                      {plural(c.count, "turno", "turnos")}
                    </td>
                    <td data-label="Total gastado">
                      {formatARS(c.totalSpent || 0)}
                    </td>
                    <td data-label="Último turno">
                      {formatRelativeDays(c.lastDate, today)}
                      {isInactiveClient(c, today) && (
                        <span className="admin-tag">Inactivo</span>
                      )}
                    </td>
                    <td
                      data-label="Contacto"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {c.phone && (
                        <a
                          href={`https://wa.me/${toWhatsappNumber(c.phone)}`}
                          target="_blank"
                          rel="noopener"
                          className="admin-table-action-btn"
                          aria-label={`WhatsApp a ${c.name}`}
                        >
                          <WhatsAppMiniIcon />
                        </a>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="5">
                  {search ? (
                    <EmptyState
                      icon={Users}
                      title={`Nadie coincide con “${search}”`}
                      text="Probá con otra parte del nombre o del teléfono."
                      action={{
                        label: "Limpiar búsqueda",
                        onClick: () => setSearchInput(""),
                      }}
                    />
                  ) : list.length === 0 ? (
                    <EmptyState
                      icon={Users}
                      title="Todavía no hay clientes"
                      text="Se arman solos con cada reserva: nombre y teléfono del organizador."
                    />
                  ) : (
                    <EmptyState
                      icon={Users}
                      title="No hay clientes en este segmento"
                      action={{
                        label: "Ver todos",
                        onClick: () => setSegment("all"),
                      }}
                    />
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {openClient && (
        <ClientDrawer
          client={openClient}
          onClose={() => setOpenClient(null)}
          onToast={onToast}
        />
      )}

      {isInviteOpen && (
        <div
          className="admin-modal-backdrop"
          onClick={() => setIsInviteOpen(false)}
        >
          <div
            className="admin-modal-card admin-modal-wide"
            role="dialog"
            aria-modal="true"
            aria-labelledby="invite-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-head">
              <h3 id="invite-title">
                Invitar a{" "}
                {plural(
                  inactiveWithPhone.length,
                  "cliente inactivo",
                  "clientes inactivos",
                )}
              </h3>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setIsInviteOpen(false)}
                aria-label="Cerrar"
              >
                <X size={16} strokeWidth={1.75} aria-hidden />
              </button>
            </div>
            <div className="admin-field">
              <label className="admin-field-label" htmlFor="invite-text">
                Mensaje ({"{nombre}"} se reemplaza por el nombre)
              </label>
              <textarea
                id="invite-text"
                rows={3}
                value={inviteText}
                onChange={(e) => setInviteText(e.target.value)}
              />
            </div>
            <p className="admin-field-hint">
              WhatsApp no permite enviar en masa desde la web: tocá cada
              contacto y se abre el chat con el mensaje listo. Se marcan a
              medida que los abrís.
            </p>
            <ul className="admin-invite-list">
              {inactiveWithPhone.map((c) => (
                <li
                  key={c.key}
                  className={invited.has(c.key) ? "is-done" : undefined}
                >
                  <span>
                    <strong>{c.name}</strong>
                    <span className="admin-cell-sub">
                      Último turno {formatRelativeDays(c.lastDate, today)}
                    </span>
                  </span>
                  <a
                    className="btn btn-secondary"
                    href={inviteLink(c)}
                    target="_blank"
                    rel="noopener"
                    onClick={() =>
                      setInvited((prev) => new Set(prev).add(c.key))
                    }
                  >
                    <WhatsAppMiniIcon />{" "}
                    {invited.has(c.key) ? "Abierto" : "Abrir chat"}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

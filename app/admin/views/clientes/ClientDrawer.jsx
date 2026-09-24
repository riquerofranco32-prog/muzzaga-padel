"use client";

import { useEffect, useState } from "react";
import { CalendarDays, UtensilsCrossed, X, Trash2 } from "lucide-react";
import {
  adminGetClientDetail,
  adminSaveClientNote,
  adminDeleteClient,
} from "../../actions";
import {
  formatARS,
  formatDate,
  formatRelativeDays,
  plural,
} from "../../../../lib/format";
import { formatPhoneAR, toWhatsappNumber } from "../../../../lib/phone";
import { todayInClub } from "../../../../lib/booking";
import { categorizeClient } from "../../../../lib/clientsExport";
import { EmptyState, SkeletonRows } from "../../ui/states";
import { WhatsAppMiniIcon } from "../../adminHelpers";
import StaffPinModal from "../../ui/StaffPinModal";

const STATUS_LABEL = {
  confirmado: "Confirmado",
  señado: "Señado",
  pagado: "Pagado",
  cancelado: "Cancelado",
  bloqueado: "Bloqueado",
};

export function initials(name) {
  return String(name || "?")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || "")
    .join("");
}

/** Panel lateral con historial, consumo en cantina, notas y WhatsApp. */
export default function ClientDrawer({ client, onClose, onToast, onDeleted }) {
  const [detail, setDetail] = useState(null);
  const [note, setNote] = useState("");
  const [savedNote, setSavedNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const today = todayInClub();

  useEffect(() => {
    let cancelled = false;
    setDetail(null);
    adminGetClientDetail(client.key).then((res) => {
      if (cancelled) return;
      if (res.ok) {
        setDetail(res);
        setNote(res.note);
        setSavedNote(res.note);
      } else {
        onToast?.(res.error || "No se pudo cargar el cliente.", {
          tone: "error",
        });
      }
    });
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      cancelled = true;
      window.removeEventListener("keydown", onKey);
    };
  }, [client.key]);

  async function saveNote() {
    setSaving(true);
    const res = await adminSaveClientNote(client.key, note);
    setSaving(false);
    if (res.ok) {
      setSavedNote(note.trim());
      onToast?.("Nota guardada");
    } else {
      onToast?.(res.error || "No se pudo guardar la nota.", { tone: "error" });
    }
  }

  const cat = categorizeClient(client.count);
  const cantinaTotal = detail?.cantina.reduce((s, c) => s + c.total, 0) || 0;

  return (
    <div className="admin-drawer-backdrop" onClick={onClose}>
      <aside
        className="admin-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="client-drawer-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="admin-drawer-head">
          <span className="admin-avatar admin-avatar-lg" aria-hidden>
            {initials(client.name)}
          </span>
          <div style={{ minWidth: 0, flex: 1 }}>
            <h3 id="client-drawer-title">{client.name}</h3>
            <span className="admin-cell-sub">
              {client.phone ? formatPhoneAR(client.phone) : "Sin teléfono"} ·{" "}
              {cat.category}
            </span>
          </div>
          <button
            type="button"
            className="admin-modal-close"
            onClick={onClose}
            aria-label="Cerrar"
          >
            <X size={16} strokeWidth={1.75} aria-hidden />
          </button>
        </header>

        {client.phone && (
          <a
            className="btn btn-whatsapp admin-btn-block"
            href={`https://wa.me/${toWhatsappNumber(client.phone)}?text=${encodeURIComponent(`Hola ${client.name.split(" ")[0]}! Te escribimos de Muzzaga Pádel 🎾`)}`}
            target="_blank"
            rel="noopener"
          >
            <WhatsAppMiniIcon size={16} /> Escribir por WhatsApp
          </a>
        )}

        <dl className="admin-drawer-stats">
          <div>
            <dt>Turnos</dt>
            <dd>{client.count}</dd>
          </div>
          <div>
            <dt>Total en turnos</dt>
            <dd>{formatARS(client.totalSpent)}</dd>
          </div>
          <div>
            <dt>Último turno</dt>
            <dd>{formatRelativeDays(client.lastDate, today)}</dd>
          </div>
          <div>
            <dt>Cliente desde</dt>
            <dd>{client.firstDate ? formatDate(client.firstDate) : "—"}</dd>
          </div>
        </dl>

        <section className="admin-drawer-section">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <label className="admin-field-label" htmlFor="client-note" style={{ margin: 0 }}>
              Notas internas del staff
            </label>
            <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
              Visible solo para recepción
            </span>
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
            {["8va", "7ma", "6ta", "5ta", "4ta", "Drive", "Revés"].map((tag) => (
              <button
                key={tag}
                type="button"
                className="btn btn-secondary"
                style={{ padding: "2px 8px", height: 24, fontSize: 11, borderRadius: 12 }}
                onClick={() => {
                  if (!note.includes(tag)) {
                    setNote((prev) => (prev.trim() ? `${prev.trim()} · ${tag}` : tag));
                  }
                }}
              >
                +{tag}
              </button>
            ))}
          </div>
          <textarea
            id="client-note"
            rows={3}
            maxLength={1000}
            placeholder="Nivel, preferencias, posición de juego, si debe algo…"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          {note.trim() !== savedNote && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={saveNote}
              disabled={saving}
            >
              {saving ? "Guardando…" : "Guardar nota"}
            </button>
          )}
        </section>

        <section className="admin-drawer-section">
          <h4>
            <CalendarDays size={16} strokeWidth={1.75} aria-hidden /> Historial
            de reservas
          </h4>
          {!detail ? (
            <SkeletonRows count={4} height={40} />
          ) : detail.bookings.length === 0 ? (
            <EmptyState icon={CalendarDays} title="Sin reservas registradas" />
          ) : (
            <ul className="admin-drawer-list">
              {detail.bookings.map((b) => (
                <li
                  key={b.id}
                  className={b.status === "cancelado" ? "is-voided" : undefined}
                >
                  <span>
                    <strong>{formatDate(b.date)}</strong> {b.startTime}
                    <small>{b.courtName}</small>
                  </span>
                  <span className="admin-tag">
                    {STATUS_LABEL[b.status] || b.status}
                  </span>
                  <span className="admin-drawer-amount">
                    {formatARS(b.total)}
                    {b.total > b.paid && b.status !== "cancelado" && (
                      <small className="is-warning">
                        Debe {formatARS(b.total - b.paid)}
                      </small>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="admin-drawer-section">
          <h4>
            <UtensilsCrossed size={16} strokeWidth={1.75} aria-hidden /> Consumo
            en cantina
            {cantinaTotal > 0 && (
              <span className="admin-cell-sub">
                {" "}
                · {formatARS(cantinaTotal)}
              </span>
            )}
          </h4>
          {!detail ? (
            <SkeletonRows count={2} height={40} />
          ) : detail.cantina.length === 0 ? (
            <p className="admin-field-hint">
              Sin consumos cargados a sus turnos. Las ventas al paso no quedan
              asociadas a un cliente.
            </p>
          ) : (
            <ul className="admin-drawer-list">
              {detail.cantina.map((c) => (
                <li key={c.id}>
                  <span>
                    <strong>{formatDate(c.date)}</strong>
                    <small>
                      {c.items.map((it) => `${it.qty}× ${it.name}`).join(", ")}
                    </small>
                  </span>
                  <span className="admin-tag">
                    {c.settled ? "Cobrado" : "A cuenta"}
                  </span>
                  <span className="admin-drawer-amount">
                    {formatARS(c.total)}
                  </span>
                </li>
              ))}
            </ul>
          )}
          {detail && (
            <p className="admin-field-hint">
              {plural(detail.cantina.length, "consumo", "consumos")}
            </p>
          )}
        </section>

        {/* Zona de peligro: eliminar cliente */}
        <section
          className="admin-drawer-section"
          style={{
            borderTop: "1px solid var(--border)",
            paddingTop: 16,
            marginTop: 10,
          }}
        >
          <button
            type="button"
            className="btn btn-secondary"
            style={{
              width: "100%",
              color: "#dc2626",
              borderColor: "#fca5a5",
              background: "#fff1f2",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              fontSize: 13,
              fontWeight: 600,
            }}
            onClick={() => setIsPinModalOpen(true)}
          >
            <Trash2 size={15} /> Eliminar cliente del sistema
          </button>
        </section>
      </aside>

      {isPinModalOpen && (
        <StaffPinModal
          isOpen={isPinModalOpen}
          title="Eliminar Cliente"
          description={`¿Confirmás que querés eliminar al cliente ${client.name}? Esta acción requiere autorización por PIN y removerá al cliente del CRM.`}
          targetName={`${client.name} (${client.phone || "Sin teléfono"})`}
          confirmButtonText="Eliminar Cliente"
          confirmButtonTone="danger"
          onClose={() => setIsPinModalOpen(false)}
          onConfirm={async ({ pin, reason }) => {
            const res = await adminDeleteClient({ key: client.key, pin, reason });
            if (res.ok) {
              setIsPinModalOpen(false);
              onToast?.(`Cliente eliminado por ${res.staff}`);
              onDeleted?.(client.key);
              onClose();
            } else {
              throw new Error(res.error || "No se pudo eliminar el cliente.");
            }
          }}
        />
      )}
    </div>
  );
}

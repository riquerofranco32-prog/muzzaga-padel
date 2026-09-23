"use client";

import {
  COURTS,
  SLOT_DURATION_MIN,
  addMinutes,
  priceForSlot,
} from "../../lib/booking";
import { IconClose, IconPlus, STATUS_OPTIONS } from "./adminHelpers";

const START_TIMES = [
  "14:00",
  "15:30",
  "17:00",
  "18:30",
  "20:00",
  "21:30",
  "23:00",
];

export default function CreateBookingModal({
  activeDate,
  modalForm,
  setModalForm,
  modalSubmitting,
  clients,
  onClose,
  onSubmit,
  onPlayerNameBlur,
}) {
  // Mismo cálculo que hace el server action, para que el modal muestre
  // exactamente el total que se va a guardar.
  const modalRate = priceForSlot(activeDate, modalForm.startTime);
  const perPlayerPrice = modalRate.perPlayer;
  const modalPrice = modalForm.fullCourt
    ? modalRate.total
    : (modalForm.playersCount || 4) * modalRate.perPlayer;

  return (
    <div className="admin-modal-backdrop" onClick={onClose}>
      <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 18,
          }}
        >
          <h3
            style={{
              fontSize: 18,
              color: "var(--color-ink)",
              margin: 0,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <IconPlus size={16} /> Cargar Turno Manual / Bloquear
          </h3>
          <button type="button" className="admin-modal-close" onClick={onClose} aria-label="Cerrar">
            <IconClose size={14} />
          </button>
        </div>

        <form onSubmit={onSubmit}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
              marginBottom: 12,
            }}
          >
            <div>
              <label className="admin-field-label">Cancha:</label>
              <select
                className="admin-modal-select"
                value={modalForm.courtId}
                onChange={(e) =>
                  setModalForm({ ...modalForm, courtId: e.target.value })
                }
              >
                {COURTS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.type})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="admin-field-label">Horario:</label>
              <select
                className="admin-modal-select"
                value={modalForm.startTime}
                onChange={(e) =>
                  setModalForm({ ...modalForm, startTime: e.target.value })
                }
              >
                {START_TIMES.map((t) => (
                  <option key={t} value={t}>
                    {t} a {addMinutes(t, SLOT_DURATION_MIN)} hs
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: 12 }}>
            <label className="admin-field-label">
              Nombre del Jugador o Motivo:
            </label>
            <input
              type="text"
              required
              list="admin-clients-datalist"
              placeholder="Ej. Juan Pérez (o 'Clase Profe Nico')"
              className="admin-input-field"
              value={modalForm.playerName}
              onChange={(e) =>
                setModalForm({ ...modalForm, playerName: e.target.value })
              }
              onBlur={onPlayerNameBlur}
            />
            <datalist id="admin-clients-datalist">
              {clients.map((c) => (
                <option key={c.phone || c.name} value={c.name} />
              ))}
            </datalist>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
              marginBottom: 12,
            }}
          >
            <div>
              <label className="admin-field-label">Teléfono de Contacto:</label>
              <input
                type="tel"
                placeholder="Ej. 299 597 4176"
                className="admin-input-field"
                value={modalForm.playerPhone}
                onChange={(e) =>
                  setModalForm({ ...modalForm, playerPhone: e.target.value })
                }
              />
            </div>

            <div>
              <label className="admin-field-label">Estado Inicial:</label>
              <select
                className="admin-modal-select"
                value={modalForm.status}
                onChange={(e) =>
                  setModalForm({ ...modalForm, status: e.target.value })
                }
              >
                {STATUS_OPTIONS.filter((o) => o.value !== "cancelado").map(
                  (o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ),
                )}
              </select>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
              marginBottom: 12,
            }}
          >
            <div>
              <label className="admin-field-label">
                Cantidad de Jugadores:
              </label>
              <select
                className="admin-modal-select"
                value={modalForm.playersCount}
                onChange={(e) =>
                  setModalForm({
                    ...modalForm,
                    playersCount: Number(e.target.value),
                  })
                }
                disabled={modalForm.fullCourt}
              >
                {[1, 2, 3, 4].map((n) => (
                  <option key={n} value={n}>
                    {n} {n === 1 ? "jugador" : "jugadores"}
                  </option>
                ))}
              </select>
            </div>

            <label className="admin-checkbox-row">
              <input
                type="checkbox"
                checked={modalForm.fullCourt}
                onChange={(e) =>
                  setModalForm({ ...modalForm, fullCourt: e.target.checked })
                }
              />
              Cancha completa
            </label>
          </div>

          <div className="admin-modal-hint">
            Se va a guardar de <strong>{modalForm.startTime}</strong> a{" "}
            <strong>
              {addMinutes(modalForm.startTime, SLOT_DURATION_MIN)}
            </strong>{" "}
            hs · Total <strong>${modalPrice.toLocaleString("es-AR")}</strong>
            {!modalForm.fullCourt &&
              ` (${modalForm.playersCount} × $${perPlayerPrice.toLocaleString("es-AR")})`}
          </div>

          <div style={{ marginBottom: 18 }}>
            <label className="admin-field-label">
              Notas u Observaciones (opcional):
            </label>
            <input
              type="text"
              placeholder="Ej. Cumpleaños, clase con profe, cancha en mantenimiento"
              className="admin-input-field"
              value={modalForm.notes}
              onChange={(e) =>
                setModalForm({ ...modalForm, notes: e.target.value })
              }
            />
          </div>

          <button
            type="submit"
            className="btn btn-linear-primary"
            style={{ width: "100%", height: 44, justifyContent: "center" }}
            disabled={modalSubmitting}
          >
            {modalSubmitting ? "Guardando..." : "Confirmar y Guardar Turno →"}
          </button>
        </form>
      </div>
    </div>
  );
}

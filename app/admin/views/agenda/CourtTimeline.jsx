"use client";

import { Banknote, Plus, Users, X } from "lucide-react";
import { paymentState, pendingAmount, paidAmount } from "../../../../lib/metrics";
import { hasSlotStarted } from "../../../../lib/clubConfig";
import { isoWeekday } from "../../../../lib/booking";
import { formatARS } from "../../../../lib/format";
import { toWhatsappNumber } from "../../../../lib/phone";
import { WhatsAppMiniIcon } from "../../adminHelpers";

const ICON = { size: 15, strokeWidth: 1.75, "aria-hidden": true };
const DAY_MIN = 24 * 60;

const toMinutes = (hhmm) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

function paymentBadge(b) {
  const state = paymentState(b);
  if (state === "bloqueado") return { state, label: "Bloqueado" };
  if (state === "prueba") return { state, label: "Prueba" };
  if (state === "pagado") return { state, label: "Pagado" };
  if (state === "senado") return { state, label: `Seña ${formatARS(paidAmount(b))}` };
  return { state, label: `Debe ${formatARS(pendingAmount(b))}` };
}

/**
 * Grilla tipo timeline: columnas = canchas, filas = franjas. Con 7 franjas
 * el día entero entra en pantalla en desktop.
 */
export default function CourtTimeline({
  courts,
  slots,
  activeDate,
  clubConfig,
  now,
  isDimmed,
  onAssign,
  onOpenDetail,
  onCancel,
}) {
  const rows = [];
  for (const s of slots) {
    if (!rows.some((r) => r.start === s.start)) rows.push({ start: s.start, end: s.end });
  }
  const cellFor = (courtId, start) =>
    slots.find((s) => s.courtId === courtId && s.start === start);

  // Línea de "ahora": solo mirando hoy y dentro del horario del club.
  let nowTopPct = null;
  if (now.isoDate === activeDate && rows.length) {
    const day = clubConfig.schedule[isoWeekday(activeDate)];
    const open = day?.open ? toMinutes(day.start) : 0;
    const rel = (hhmm) => {
      const m = toMinutes(hhmm);
      return m < open ? m + DAY_MIN : m;
    };
    const current = toMinutes(now.hhmm);
    const first = rel(rows[0].start);
    const last = rel(rows[rows.length - 1].end) || first;
    const end = last <= first ? last + DAY_MIN : last;
    if (current >= first && current <= end) {
      nowTopPct = ((current - first) / (end - first)) * 100;
    }
  }

  return (
    <div className="admin-timeline" style={{ "--courts": courts.length }}>
      <div className="admin-timeline-head" aria-hidden>
        <span />
        {courts.map((c) => (
          <strong key={c.id}>
            {c.name}
            {c.type && <small> · {c.type}</small>}
          </strong>
        ))}
      </div>

      <div className="admin-timeline-body" role="grid" aria-label="Turnos del día por cancha">
        {nowTopPct != null && (
          <div className="admin-timeline-now" style={{ top: `${nowTopPct}%` }} aria-hidden>
            <span>{now.hhmm}</span>
          </div>
        )}

        {rows.map((row) => {
          const isPast = hasSlotStarted(clubConfig, activeDate, row.end, now);
          return (
            <div
              key={row.start}
              role="row"
              className={`admin-timeline-row${isPast ? " is-past" : ""}`}
            >
              <div className="admin-timeline-time" role="rowheader">
                <strong>{row.start}</strong>
                <span>{row.end}</span>
              </div>

              {courts.map((court) => {
                const slot = cellFor(court.id, row.start);
                const b = slot?.booking;
                if (!slot) return <div key={court.id} role="gridcell" />;

                if (!slot.isTaken) {
                  return (
                    <div key={court.id} role="gridcell" className="admin-slot is-free">
                      <button
                        type="button"
                        className="admin-slot-assign"
                        onClick={() => onAssign(court.id, row.start)}
                        aria-label={`Asignar ${court.name} a las ${row.start}`}
                      >
                        <Plus {...ICON} /> Asignar
                      </button>
                    </div>
                  );
                }

                // Lock sin reserva asociada (dato inconsistente): se muestra ocupado.
                if (!b) {
                  return (
                    <div key={court.id} role="gridcell" className="admin-slot is-taken" data-state="bloqueado">
                      <span className="admin-slot-name">Ocupado</span>
                    </div>
                  );
                }

                const badge = paymentBadge(b);
                return (
                  <div
                    key={court.id}
                    role="gridcell"
                    className={`admin-slot is-taken${isDimmed?.(b) ? " is-dimmed" : ""}`}
                    data-state={badge.state}
                  >
                    <button
                      type="button"
                      className="admin-slot-main"
                      onClick={() => onOpenDetail(b)}
                      aria-label={`${b.playerName}, ${row.start} en ${court.name}. ${badge.label}. Ver detalle`}
                    >
                      <span className="admin-slot-name">{b.playerName}</span>
                      <span className="admin-slot-meta">
                        {badge.state !== "bloqueado" && (
                          <>
                            <Users size={12} strokeWidth={1.75} aria-hidden /> {b.playersCount || 4}
                          </>
                        )}
                        <span className="admin-slot-badge">{badge.label}</span>
                      </span>
                    </button>
                    <div className="admin-slot-actions">
                      {pendingAmount(b) > 0 && (
                        <button
                          type="button"
                          onClick={() => onOpenDetail(b)}
                          aria-label={`Cobrar a ${b.playerName}`}
                          title="Cobrar"
                        >
                          <Banknote {...ICON} />
                        </button>
                      )}
                      {b.playerPhone && (
                        <a
                          href={`https://wa.me/${toWhatsappNumber(b.playerPhone)}`}
                          target="_blank"
                          rel="noopener"
                          aria-label={`WhatsApp a ${b.playerName}`}
                          title="WhatsApp"
                        >
                          <WhatsAppMiniIcon size={14} />
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => onCancel(b.id, court.id, row.start)}
                        aria-label={`Cancelar turno de ${b.playerName}`}
                        title="Cancelar y liberar"
                      >
                        <X {...ICON} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

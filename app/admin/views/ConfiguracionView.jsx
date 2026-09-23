"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarX,
  Clock,
  Copy,
  CreditCard,
  Eye,
  EyeOff,
  Plus,
  Store,
  Tag,
  Trash2,
  X,
} from "lucide-react";
import { adminGetClubConfig, adminSaveClubConfig } from "../actions";
import {
  MAX_COURTS,
  depositFor,
  maskCbu,
  normalizeConfig,
  slotTimesFor,
} from "../../../lib/clubConfig";
import { isoAddDays, todayInClub } from "../../../lib/booking";
import { formatARS, formatDate, plural } from "../../../lib/format";
import { Skeleton } from "../ui/states";

const ICON = { size: 18, strokeWidth: 1.75, "aria-hidden": true };
const WEEKDAYS = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];
// Se muestra lunes primero, como lo piensa el club.
const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];

const SECTIONS = [
  { id: "canchas", label: "Canchas y precios", icon: Tag },
  { id: "horarios", label: "Horarios", icon: Clock },
  { id: "cobros", label: "Cobros", icon: CreditCard },
  { id: "cierres", label: "Cierres", icon: CalendarX },
  { id: "club", label: "Club", icon: Store },
];

/** Próximo día de la semana `weekday` desde hoy, para previsualizar turnos. */
function nextDateFor(weekday) {
  const today = todayInClub();
  for (let i = 0; i < 7; i += 1) {
    const d = isoAddDays(today, i);
    if (new Date(`${d}T12:00:00Z`).getUTCDay() === weekday) return d;
  }
  return today;
}

export default function ConfiguracionView({
  onExpiredSession,
  onToast,
  onSaved,
}) {
  const [saved, setSaved] = useState(null);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [newBlockedDate, setNewBlockedDate] = useState("");
  const [showCbu, setShowCbu] = useState(false);
  const [activeSection, setActiveSection] = useState("canchas");

  useEffect(() => {
    adminGetClubConfig().then((res) => {
      if (res.ok) {
        setSaved(res.config);
        setForm(res.config);
      } else {
        onExpiredSession?.(res);
      }
    });
  }, []);

  const isDirty = useMemo(
    () =>
      Boolean(form && saved && JSON.stringify(form) !== JSON.stringify(saved)),
    [form, saved],
  );

  // Avisar antes de cerrar la pestaña con cambios sin guardar.
  useEffect(() => {
    if (!isDirty) return;
    const warn = (e) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [isDirty]);

  if (!form) {
    return (
      <div className="admin-settings" aria-busy="true">
        <Skeleton height={220} radius={12} />
        <Skeleton height={420} radius={12} />
      </div>
    );
  }

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));
  const setPricing = (band, patch) =>
    setForm((f) => ({
      ...f,
      pricing: { ...f.pricing, [band]: { ...f.pricing[band], ...patch } },
    }));
  const setDay = (weekday, patch) =>
    setForm((f) => ({
      ...f,
      schedule: f.schedule.map((d, i) =>
        i === weekday ? { ...d, ...patch } : d,
      ),
    }));

  function setCourtCount(count) {
    const n = Math.min(MAX_COURTS, Math.max(1, count));
    setForm((f) => {
      const courts = Array.from(
        { length: n },
        (_, i) =>
          f.courts[i] || {
            id: `cancha-${i + 1}`,
            name: `Cancha ${i + 1}`,
            type: "Cristal",
          },
      );
      return { ...f, courts };
    });
  }

  function setCourt(index, patch) {
    setForm((f) => ({
      ...f,
      courts: f.courts.map((c, i) => (i === index ? { ...c, ...patch } : c)),
    }));
  }

  function addBlockedDate() {
    if (!newBlockedDate || form.blockedDates.includes(newBlockedDate)) return;
    set({ blockedDates: [...form.blockedDates, newBlockedDate].sort() });
    setNewBlockedDate("");
  }

  async function copyCbu() {
    try {
      await navigator.clipboard.writeText(form.paymentCbu);
      onToast?.("CBU copiado");
    } catch {
      onToast?.("No se pudo copiar el CBU.", { tone: "error" });
    }
  }

  async function handleSave() {
    setSaving(true);
    setFieldErrors({});
    const res = await adminSaveClubConfig(form);
    setSaving(false);
    if (res.ok) {
      const config = normalizeConfig(res.config);
      setSaved(config);
      setForm(config);
      onSaved?.(config);
      onToast?.("Configuración guardada");
    } else if (!onExpiredSession?.(res)) {
      setFieldErrors(res.fieldErrors || {});
      onToast?.(res.error || "No se pudo guardar la configuración.", {
        tone: "error",
      });
    }
  }

  function goTo(id) {
    setActiveSection(id);
    document
      .getElementById(`cfg-${id}`)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const err = (key) =>
    fieldErrors[key] ? (
      <p className="admin-field-error" role="alert">
        {fieldErrors[key]}
      </p>
    ) : null;

  const valle = form.pricing.valle;
  const pico = form.pricing.pico;
  const autoPerPlayer = (court) => Math.round((Number(court) || 0) / 4);
  const cbuDigits = form.paymentCbu.replace(/\D/g, "");
  const cbuInvalid = cbuDigits.length > 0 && cbuDigits.length !== 22;

  return (
    <div className="admin-settings">
      <nav
        className="admin-settings-nav"
        aria-label="Secciones de configuración"
      >
        {SECTIONS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            aria-current={activeSection === id ? "true" : undefined}
            onClick={() => goTo(id)}
          >
            <Icon {...ICON} />
            {label}
          </button>
        ))}
      </nav>

      <div className="admin-settings-body">
        {/* CANCHAS Y PRECIOS */}
        <section id="cfg-canchas" className="admin-settings-card">
          <h3 className="admin-section-title">
            <Tag {...ICON} /> Canchas y precios
          </h3>

          <div className="admin-field">
            <label className="admin-field-label" htmlFor="cfg-court-count">
              Cantidad de canchas
            </label>
            <div className="admin-stepper">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setCourtCount(form.courts.length - 1)}
                disabled={form.courts.length <= 1}
                aria-label="Una cancha menos"
              >
                −
              </button>
              <output id="cfg-court-count">{form.courts.length}</output>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setCourtCount(form.courts.length + 1)}
                disabled={form.courts.length >= MAX_COURTS}
                aria-label="Una cancha más"
              >
                +
              </button>
            </div>
            <p className="admin-field-hint">
              Si sacás una cancha que tiene reservas futuras, esas reservas
              siguen en la base pero no aparecen en la grilla.
            </p>
          </div>

          <div className="admin-court-names">
            {form.courts.map((c, i) => (
              <div key={c.id} className="admin-field-row">
                <div className="admin-field">
                  <label
                    className="admin-field-label"
                    htmlFor={`cfg-court-${i}`}
                  >
                    Nombre cancha {i + 1}
                  </label>
                  <input
                    id={`cfg-court-${i}`}
                    type="text"
                    maxLength={30}
                    value={c.name}
                    onChange={(e) => setCourt(i, { name: e.target.value })}
                  />
                </div>
                <div className="admin-field">
                  <label
                    className="admin-field-label"
                    htmlFor={`cfg-court-type-${i}`}
                  >
                    Tipo
                  </label>
                  <input
                    id={`cfg-court-type-${i}`}
                    type="text"
                    maxLength={20}
                    placeholder="Cristal, techada…"
                    value={c.type}
                    onChange={(e) => setCourt(i, { type: e.target.value })}
                  />
                </div>
              </div>
            ))}
          </div>
          {err("courts")}

          <label className="admin-toggle">
            <input
              type="checkbox"
              checked={form.pricing.picoEnabled}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  pricing: { ...f.pricing, picoEnabled: e.target.checked },
                }))
              }
            />
            Precio diferenciado en horario pico
          </label>

          <div className="admin-price-bands">
            {[
              [
                "valle",
                form.pricing.picoEnabled ? "Horario valle" : "Precio del turno",
                valle,
              ],
              ...(form.pricing.picoEnabled
                ? [["pico", "Horario pico", pico]]
                : []),
            ].map(([band, label, value]) => (
              <fieldset key={band} className="admin-price-band">
                <legend>{label}</legend>
                <div className="admin-field">
                  <label
                    className="admin-field-label"
                    htmlFor={`cfg-${band}-court`}
                  >
                    Cancha completa ($)
                  </label>
                  <input
                    id={`cfg-${band}-court`}
                    type="number"
                    inputMode="numeric"
                    min={1}
                    value={value.court}
                    onChange={(e) =>
                      setPricing(band, { court: Number(e.target.value) })
                    }
                  />
                  {err(`pricing.${band}`)}
                </div>
                <div className="admin-field">
                  <label
                    className="admin-field-label"
                    htmlFor={`cfg-${band}-pp`}
                  >
                    Por jugador ($)
                  </label>
                  {value.perPlayer == null ? (
                    <div className="admin-computed">
                      <strong>{formatARS(autoPerPlayer(value.court))}</strong>
                      <span>cancha ÷ 4</span>
                      <button
                        type="button"
                        className="admin-link-btn"
                        onClick={() =>
                          setPricing(band, {
                            perPlayer: autoPerPlayer(value.court),
                          })
                        }
                      >
                        Personalizar
                      </button>
                    </div>
                  ) : (
                    <div className="admin-computed">
                      <input
                        id={`cfg-${band}-pp`}
                        type="number"
                        inputMode="numeric"
                        min={1}
                        value={value.perPlayer}
                        onChange={(e) =>
                          setPricing(band, {
                            perPlayer: Number(e.target.value),
                          })
                        }
                      />
                      <button
                        type="button"
                        className="admin-link-btn"
                        onClick={() => setPricing(band, { perPlayer: null })}
                      >
                        Volver a automático
                      </button>
                    </div>
                  )}
                  {err(`pricing.${band}.perPlayer`)}
                </div>
              </fieldset>
            ))}
          </div>

          {form.pricing.picoEnabled && (
            <div className="admin-field" style={{ maxWidth: 220 }}>
              <label className="admin-field-label" htmlFor="cfg-pico-desde">
                Horario pico desde
              </label>
              <input
                id="cfg-pico-desde"
                type="time"
                value={form.pricing.picoDesde}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    pricing: { ...f.pricing, picoDesde: e.target.value },
                  }))
                }
              />
              <p className="admin-field-hint">
                Los turnos que arrancan desde esta hora (hasta el cierre) cobran
                precio pico.
              </p>
              {err("pricing.picoDesde")}
            </div>
          )}
        </section>

        {/* HORARIOS */}
        <section id="cfg-horarios" className="admin-settings-card">
          <h3 className="admin-section-title">
            <Clock {...ICON} /> Horarios
          </h3>

          <div className="admin-field" style={{ maxWidth: 220 }}>
            <label className="admin-field-label" htmlFor="cfg-duration">
              Duración del turno
            </label>
            <select
              id="cfg-duration"
              value={form.slotDurationMin}
              onChange={(e) => set({ slotDurationMin: Number(e.target.value) })}
            >
              {[60, 75, 90, 105, 120].map((m) => (
                <option key={m} value={m}>
                  {m} minutos
                </option>
              ))}
            </select>
            {err("slotDurationMin")}
          </div>

          <div className="admin-schedule">
            {WEEK_ORDER.map((weekday) => {
              const day = form.schedule[weekday];
              const preview = day.open
                ? slotTimesFor(
                    { ...form, blockedDates: [] },
                    nextDateFor(weekday),
                  )
                : [];
              return (
                <div key={weekday} className="admin-schedule-row">
                  <label className="admin-toggle">
                    <input
                      type="checkbox"
                      checked={day.open}
                      onChange={(e) =>
                        setDay(weekday, { open: e.target.checked })
                      }
                    />
                    <span className="admin-schedule-day">
                      {WEEKDAYS[weekday]}
                    </span>
                  </label>
                  {day.open ? (
                    <>
                      <input
                        type="time"
                        aria-label={`Apertura ${WEEKDAYS[weekday]}`}
                        value={day.start}
                        onChange={(e) =>
                          setDay(weekday, { start: e.target.value })
                        }
                      />
                      <span aria-hidden>a</span>
                      <input
                        type="time"
                        aria-label={`Cierre ${WEEKDAYS[weekday]}`}
                        value={day.end}
                        onChange={(e) =>
                          setDay(weekday, { end: e.target.value })
                        }
                      />
                      <span className="admin-field-hint">
                        {plural(preview.length, "turno", "turnos")}
                        {preview.length > 0 &&
                          ` · ${preview[0].start} a ${preview[preview.length - 1].end}`}
                      </span>
                    </>
                  ) : (
                    <span className="admin-field-hint">Cerrado</span>
                  )}
                  {err(`schedule.${weekday}`)}
                </div>
              );
            })}
          </div>
          <p className="admin-field-hint">
            Un cierre antes de la apertura (ej. 00:30) se toma como del día
            siguiente.
          </p>
        </section>

        {/* COBROS */}
        <section id="cfg-cobros" className="admin-settings-card">
          <h3 className="admin-section-title">
            <CreditCard {...ICON} /> Cobros
          </h3>

          <div className="admin-field" style={{ maxWidth: 260 }}>
            <label className="admin-field-label" htmlFor="cfg-deposit">
              Seña (% del turno)
            </label>
            <input
              id="cfg-deposit"
              type="number"
              min={0}
              max={100}
              value={form.depositPct}
              onChange={(e) => set({ depositPct: Number(e.target.value) })}
            />
            <p className="admin-field-hint">
              Un turno de {formatARS(valle.court)} pide{" "}
              {formatARS(depositFor(form, valle.court))} de seña.
            </p>
            {err("depositPct")}
          </div>

          <div className="admin-field-row">
            <div className="admin-field">
              <label className="admin-field-label" htmlFor="cfg-alias">
                Alias
              </label>
              <input
                id="cfg-alias"
                type="text"
                value={form.paymentAlias}
                onChange={(e) => set({ paymentAlias: e.target.value })}
              />
            </div>
            <div className="admin-field">
              <label className="admin-field-label" htmlFor="cfg-titular">
                Titular de la cuenta
              </label>
              <input
                id="cfg-titular"
                type="text"
                value={form.paymentTitular}
                onChange={(e) => set({ paymentTitular: e.target.value })}
              />
            </div>
          </div>

          <div className="admin-field">
            <label className="admin-field-label" htmlFor="cfg-cbu">
              CBU / CVU
            </label>
            <div className="admin-cbu">
              {showCbu ? (
                <input
                  id="cfg-cbu"
                  className="admin-mono"
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  maxLength={26}
                  value={form.paymentCbu}
                  aria-invalid={cbuInvalid || undefined}
                  onChange={(e) =>
                    set({ paymentCbu: e.target.value.replace(/[^\d\s]/g, "") })
                  }
                />
              ) : (
                <output id="cfg-cbu" className="admin-mono admin-cbu-masked">
                  {cbuDigits ? maskCbu(cbuDigits) : "Sin cargar"}
                </output>
              )}
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowCbu((v) => !v)}
                aria-label={showCbu ? "Ocultar CBU" : "Mostrar y editar CBU"}
              >
                {showCbu ? <EyeOff {...ICON} /> : <Eye {...ICON} />}
                {showCbu ? "Ocultar" : "Editar"}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={copyCbu}
                disabled={!cbuDigits}
                aria-label="Copiar CBU"
              >
                <Copy {...ICON} /> Copiar
              </button>
            </div>
            {cbuInvalid ? (
              <p className="admin-field-error" role="alert">
                Tiene {cbuDigits.length} dígitos: un CBU/CVU tiene 22.
              </p>
            ) : (
              err("paymentCbu")
            )}
          </div>
        </section>

        {/* CIERRES */}
        <section id="cfg-cierres" className="admin-settings-card">
          <h3 className="admin-section-title">
            <CalendarX {...ICON} /> Días de cierre extraordinario
          </h3>
          <p className="admin-field-hint" style={{ marginTop: 0 }}>
            Feriados, mantenimiento o eventos: ese día no se puede reservar ni
            en la web ni en la agenda.
          </p>
          <div className="admin-inline-form">
            <input
              type="date"
              aria-label="Fecha a bloquear"
              min={todayInClub()}
              value={newBlockedDate}
              onChange={(e) => setNewBlockedDate(e.target.value)}
            />
            <button
              type="button"
              className="btn btn-secondary"
              onClick={addBlockedDate}
              disabled={!newBlockedDate}
            >
              <Plus {...ICON} /> Bloquear día
            </button>
          </div>
          {form.blockedDates.length === 0 ? (
            <p className="admin-field-hint">No hay días bloqueados.</p>
          ) : (
            <ul className="admin-chip-list">
              {form.blockedDates.map((d) => (
                <li key={d} className="admin-chip">
                  {formatDate(d, "long")}
                  <button
                    type="button"
                    onClick={() =>
                      set({
                        blockedDates: form.blockedDates.filter((x) => x !== d),
                      })
                    }
                    aria-label={`Desbloquear ${formatDate(d, "long")}`}
                  >
                    <X size={14} strokeWidth={1.75} aria-hidden />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* CLUB */}
        <section id="cfg-club" className="admin-settings-card">
          <h3 className="admin-section-title">
            <Store {...ICON} /> Club
          </h3>
          <div className="admin-field" style={{ maxWidth: 320 }}>
            <label className="admin-field-label" htmlFor="cfg-phone">
              WhatsApp del club
            </label>
            <input
              id="cfg-phone"
              type="tel"
              inputMode="tel"
              value={form.clubPhone}
              onChange={(e) => set({ clubPhone: e.target.value })}
            />
            <p className="admin-field-hint">
              Con código de país, sin espacios: 549…
            </p>
          </div>
        </section>
      </div>

      {isDirty && (
        <div
          className="admin-unsaved-bar"
          role="region"
          aria-label="Cambios sin guardar"
        >
          <span>Cambios sin guardar</span>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setForm(saved);
                setFieldErrors({});
              }}
              disabled={saving}
            >
              <Trash2 {...ICON} /> Descartar
            </button>
            <button
              type="button"
              className="btn btn-linear-primary"
              onClick={handleSave}
              disabled={saving || cbuInvalid}
            >
              {saving ? "Guardando…" : "Guardar"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

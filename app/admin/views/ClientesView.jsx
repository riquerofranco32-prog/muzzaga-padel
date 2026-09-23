"use client";

import { useMemo, useState } from "react";
import { toWhatsappNumber } from "../../../lib/phone";
import { plural } from "../../../lib/format";
import {
  categorizeClient,
  getClientsMetrics,
  generateClientsCsv,
} from "../../../lib/clientsExport";
import { IconClose, IconSearch, WhatsAppMiniIcon } from "../adminHelpers";

export default function ClientesView({ clients = [] }) {
  const [clientSearch, setClientSearch] = useState("");
  const [segmentFilter, setSegmentFilter] = useState("all"); // "all" | "vip" | "frecuente" | "nuevo"

  const metrics = useMemo(() => getClientsMetrics(clients), [clients]);

  const filteredClients = useMemo(() => {
    let result = clients;

    if (segmentFilter === "vip") {
      result = result.filter((c) => (c.count || 0) >= 4);
    } else if (segmentFilter === "frecuente") {
      result = result.filter((c) => (c.count || 0) >= 2 && (c.count || 0) < 4);
    } else if (segmentFilter === "nuevo") {
      result = result.filter((c) => (c.count || 0) === 1);
    }

    if (clientSearch.trim()) {
      const q = clientSearch.toLowerCase();
      result = result.filter(
        (c) =>
          (c.name || "").toLowerCase().includes(q) ||
          (c.phone || "").includes(q),
      );
    }

    return result;
  }, [clients, segmentFilter, clientSearch]);

  const handleExportCsv = () => {
    if (!clients || clients.length === 0) return;
    const csvContent = generateClientsCsv(clients);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `clientes-muzzaga-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
          marginBottom: 16,
        }}
      >
        <div>
          <h2 className="admin-section-title" style={{ margin: 0 }}>
            Base de Jugadores ({clients.length})
          </h2>
          <p
            style={{
              fontSize: 13,
              color: "var(--text-secondary)",
              margin: "4px 0 0",
            }}
          >
            Fidelización, historial de reservas y contacto directo por WhatsApp.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportCsv}
          disabled={clients.length === 0}
          className="btn btn-secondary"
          style={{
            height: 36,
            padding: "6px 14px",
            fontSize: 12.5,
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
          }}
          title="Descargar listado completo de clientes en Excel / CSV"
        >
          <span>📥</span> Exportar Clientes (CSV)
        </button>
      </div>

      {/* KPI Cards de Clientes */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: 12,
          marginBottom: 20,
        }}
      >
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-md, 8px)",
            padding: "12px 16px",
          }}
        >
          <div
            style={{
              fontSize: 11,
              color: "var(--text-muted)",
              textTransform: "uppercase",
              fontWeight: 700,
            }}
          >
            Total Jugadores
          </div>
          <div
            style={{
              fontSize: 22,
              fontWeight: 800,
              color: "var(--text-primary)",
              marginTop: 4,
            }}
          >
            {metrics.totalClients}
          </div>
          <div
            style={{
              fontSize: 11.5,
              color: "var(--text-secondary)",
              marginTop: 2,
            }}
          >
            {plural(metrics.totalBookings, "turno jugado", "turnos jugados")}
          </div>
        </div>

        <div
          style={{
            background: "rgba(245, 158, 11, 0.06)",
            border: "1px solid rgba(245, 158, 11, 0.25)",
            borderRadius: "var(--radius-md, 8px)",
            padding: "12px 16px",
          }}
        >
          <div
            style={{
              fontSize: 11,
              color: "#b45309",
              textTransform: "uppercase",
              fontWeight: 700,
            }}
          >
            ⭐ Jugadores VIP
          </div>
          <div
            style={{
              fontSize: 22,
              fontWeight: 800,
              color: "#d97706",
              marginTop: 4,
            }}
          >
            {metrics.vipCount}
          </div>
          <div
            style={{
              fontSize: 11.5,
              color: "var(--text-secondary)",
              marginTop: 2,
            }}
          >
            4 o más turnos
          </div>
        </div>

        <div
          style={{
            background: "rgba(59, 130, 246, 0.06)",
            border: "1px solid rgba(59, 130, 246, 0.25)",
            borderRadius: "var(--radius-md, 8px)",
            padding: "12px 16px",
          }}
        >
          <div
            style={{
              fontSize: 11,
              color: "#2563eb",
              textTransform: "uppercase",
              fontWeight: 700,
            }}
          >
            🎾 Frecuentes
          </div>
          <div
            style={{
              fontSize: 22,
              fontWeight: 800,
              color: "#3b82f6",
              marginTop: 4,
            }}
          >
            {metrics.frequentCount}
          </div>
          <div
            style={{
              fontSize: 11.5,
              color: "var(--text-secondary)",
              marginTop: 2,
            }}
          >
            2 a 3 turnos
          </div>
        </div>

        <div
          style={{
            background: "rgba(16, 185, 129, 0.06)",
            border: "1px solid rgba(16, 185, 129, 0.25)",
            borderRadius: "var(--radius-md, 8px)",
            padding: "12px 16px",
          }}
        >
          <div
            style={{
              fontSize: 11,
              color: "#059669",
              textTransform: "uppercase",
              fontWeight: 700,
            }}
          >
            🌱 Nuevos
          </div>
          <div
            style={{
              fontSize: 22,
              fontWeight: 800,
              color: "#10b981",
              marginTop: 4,
            }}
          >
            {metrics.newCount}
          </div>
          <div
            style={{
              fontSize: 11.5,
              color: "var(--text-secondary)",
              marginTop: 2,
            }}
          >
            Primer turno
          </div>
        </div>
      </div>

      {/* Controles de Búsqueda y Segmentación */}
      <div
        style={{
          display: "flex",
          gap: 12,
          alignItems: "center",
          flexWrap: "wrap",
          marginBottom: 16,
        }}
      >
        <div className="admin-search-wrap" style={{ flex: "1 1 240px" }}>
          <IconSearch />
          <input
            type="text"
            placeholder="Buscar por nombre o teléfono..."
            className="admin-search-input"
            value={clientSearch}
            onChange={(e) => setClientSearch(e.target.value)}
          />
          {clientSearch && (
            <button
              type="button"
              className="admin-search-clear"
              onClick={() => setClientSearch("")}
              aria-label="Limpiar búsqueda"
              title="Limpiar búsqueda"
            >
              <IconClose size={12} />
            </button>
          )}
        </div>

        {/* Pestañas de Segmentos */}
        <div
          style={{
            display: "inline-flex",
            background: "var(--surface-muted, #f1f5f9)",
            padding: 3,
            borderRadius: 8,
            gap: 2,
          }}
        >
          <button
            type="button"
            className={`btn-secondary${segmentFilter === "all" ? " active" : ""}`}
            style={{
              padding: "4px 10px",
              fontSize: 12,
              borderRadius: 6,
              background:
                segmentFilter === "all"
                  ? "var(--surface, #fff)"
                  : "transparent",
              boxShadow:
                segmentFilter === "all" ? "0 1px 2px rgba(0,0,0,0.08)" : "none",
              fontWeight: segmentFilter === "all" ? 600 : 400,
            }}
            onClick={() => setSegmentFilter("all")}
          >
            Todos ({clients.length})
          </button>
          <button
            type="button"
            className={`btn-secondary${segmentFilter === "vip" ? " active" : ""}`}
            style={{
              padding: "4px 10px",
              fontSize: 12,
              borderRadius: 6,
              background:
                segmentFilter === "vip"
                  ? "var(--surface, #fff)"
                  : "transparent",
              boxShadow:
                segmentFilter === "vip" ? "0 1px 2px rgba(0,0,0,0.08)" : "none",
              fontWeight: segmentFilter === "vip" ? 600 : 400,
            }}
            onClick={() => setSegmentFilter("vip")}
          >
            ⭐ VIP ({metrics.vipCount})
          </button>
          <button
            type="button"
            className={`btn-secondary${segmentFilter === "frecuente" ? " active" : ""}`}
            style={{
              padding: "4px 10px",
              fontSize: 12,
              borderRadius: 6,
              background:
                segmentFilter === "frecuente"
                  ? "var(--surface, #fff)"
                  : "transparent",
              boxShadow:
                segmentFilter === "frecuente"
                  ? "0 1px 2px rgba(0,0,0,0.08)"
                  : "none",
              fontWeight: segmentFilter === "frecuente" ? 600 : 400,
            }}
            onClick={() => setSegmentFilter("frecuente")}
          >
            🎾 Frecuentes ({metrics.frequentCount})
          </button>
          <button
            type="button"
            className={`btn-secondary${segmentFilter === "nuevo" ? " active" : ""}`}
            style={{
              padding: "4px 10px",
              fontSize: 12,
              borderRadius: 6,
              background:
                segmentFilter === "nuevo"
                  ? "var(--surface, #fff)"
                  : "transparent",
              boxShadow:
                segmentFilter === "nuevo"
                  ? "0 1px 2px rgba(0,0,0,0.08)"
                  : "none",
              fontWeight: segmentFilter === "nuevo" ? 600 : 400,
            }}
            onClick={() => setSegmentFilter("nuevo")}
          >
            🌱 Nuevos ({metrics.newCount})
          </button>
        </div>
      </div>

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Nombre y Fidelización</th>
              <th>Teléfono</th>
              <th>Turnos jugados</th>
              <th>Último turno</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredClients.length > 0 ? (
              filteredClients.map((c) => {
                const cat = categorizeClient(c.count);
                return (
                  <tr key={c.phone || c.name}>
                    <td>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <strong>{c.name}</strong>
                        {cat.category === "VIP" && (
                          <span
                            style={{
                              background: "rgba(245, 158, 11, 0.14)",
                              color: "#b45309",
                              border: "1px solid rgba(245, 158, 11, 0.35)",
                              borderRadius: 12,
                              padding: "2px 8px",
                              fontSize: 11,
                              fontWeight: 700,
                              whiteSpace: "nowrap",
                            }}
                          >
                            ⭐ VIP
                          </span>
                        )}
                        {cat.category === "Frecuente" && (
                          <span
                            style={{
                              background: "rgba(59, 130, 246, 0.1)",
                              color: "#2563eb",
                              border: "1px solid rgba(59, 130, 246, 0.25)",
                              borderRadius: 12,
                              padding: "2px 8px",
                              fontSize: 11,
                              fontWeight: 600,
                              whiteSpace: "nowrap",
                            }}
                          >
                            🎾 Frecuente
                          </span>
                        )}
                        {cat.category === "Nuevo" && (
                          <span
                            style={{
                              background: "rgba(16, 185, 129, 0.08)",
                              color: "#059669",
                              border: "1px solid rgba(16, 185, 129, 0.2)",
                              borderRadius: 12,
                              padding: "2px 8px",
                              fontSize: 11,
                              fontWeight: 500,
                              whiteSpace: "nowrap",
                            }}
                          >
                            🌱 1er turno
                          </span>
                        )}
                      </div>
                    </td>
                    <td
                      style={{
                        color: "var(--text-secondary)",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      {c.phone || "-"}
                    </td>
                    <td>
                      <span
                        style={{
                          fontWeight: c.count >= 4 ? 700 : 500,
                          color:
                            c.count >= 4
                              ? "var(--color-primary-orange, #ff5722)"
                              : "inherit",
                        }}
                      >
                        {c.count} {c.count === 1 ? "turno" : "turnos"}
                      </span>
                    </td>
                    <td>{c.lastDate || "-"}</td>
                    <td>
                      {c.phone && (
                        <a
                          href={`https://wa.me/${toWhatsappNumber(c.phone)}`}
                          target="_blank"
                          rel="noopener"
                          className="admin-table-action-btn"
                          title={`Enviar WhatsApp a ${c.name}`}
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
                <td
                  colSpan="5"
                  style={{
                    textAlign: "center",
                    padding: "32px",
                    color: "var(--text-muted)",
                  }}
                >
                  {clientSearch
                    ? `No hay clientes que coincidan con "${clientSearch}".`
                    : "No hay clientes en este segmento."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

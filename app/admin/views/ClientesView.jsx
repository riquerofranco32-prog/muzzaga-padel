"use client";

import { useState } from "react";
import { toWhatsappNumber } from "../../../lib/phone";
import { IconClose, IconSearch, WhatsAppMiniIcon } from "../adminHelpers";

export default function ClientesView({ clients }) {
  const [clientSearch, setClientSearch] = useState("");

  const filteredClients = clientSearch
    ? clients.filter(
        (c) =>
          c.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
          c.phone.includes(clientSearch),
      )
    : clients;

  return (
    <div>
      <h2 className="admin-section-title">
        Clientes ({filteredClients.length})
      </h2>
      <div className="admin-search-wrap" style={{ marginBottom: 16 }}>
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

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Teléfono</th>
              <th>Turnos jugados</th>
              <th>Último turno</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredClients.length > 0 ? (
              filteredClients.map((c) => (
                <tr key={c.phone || c.name}>
                  <td>
                    <strong>{c.name}</strong>
                  </td>
                  <td
                    style={{
                      color: "var(--text-secondary)",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    {c.phone || "-"}
                  </td>
                  <td>{c.count}</td>
                  <td>{c.lastDate || "-"}</td>
                  <td>
                    {c.phone && (
                      <a
                        href={`https://wa.me/${toWhatsappNumber(c.phone)}`}
                        target="_blank"
                        rel="noopener"
                        className="admin-table-action-btn"
                        title="Chat WhatsApp"
                      >
                        <WhatsAppMiniIcon />
                      </a>
                    )}
                  </td>
                </tr>
              ))
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
                    : "Todavía no hay clientes registrados."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

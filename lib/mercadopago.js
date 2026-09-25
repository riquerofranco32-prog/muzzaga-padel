/**
 * Utilidades para integración de pagos con Mercado Pago Checkout Pro.
 * Permite abonar la seña del 50% o el total del turno en Muzzaga Pádel.
 */

import { SITE_URL } from "./site.js";

const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN || null;

/**
 * Calcula el monto de la seña (50% del total de la cancha)
 */
export function calculateDeposit(total) {
  return Math.round(Number(total || 60000) / 2);
}

/**
 * Genera el payload de preferencia para Mercado Pago Checkout Pro
 */
export function buildPreferencePayload({
  bookingCode,
  courtName,
  date,
  startTime,
  endTime,
  amount,
  payerEmail = "pagos@muzzagapadel.com.ar",
  payerName = "Cliente Muzzaga",
  siteUrl = SITE_URL,
}) {
  return {
    items: [
      {
        id: bookingCode,
        title: `Seña Turno Muzzaga Pádel - ${courtName} (${date} ${startTime} a ${endTime} hs)`,
        description: `Seña del 50% para reserva de cancha de cristal en Muzzaga Pádel (Catriel). Código: ${bookingCode}`,
        quantity: 1,
        currency_id: "ARS",
        unit_price: Number(amount),
      },
    ],
    payer: {
      name: payerName,
      email: payerEmail,
    },
    back_urls: {
      success: `${siteUrl}/?reserva=${bookingCode}&status=approved`,
      pending: `${siteUrl}/?reserva=${bookingCode}&status=pending`,
      failure: `${siteUrl}/?reserva=${bookingCode}&status=failure`,
    },
    auto_return: "approved",
    external_reference: bookingCode,
    notification_url: `${siteUrl}/api/mercadopago/webhook`,
    statement_descriptor: "MUZZAGA PADEL",
  };
}

/**
 * Crea la preferencia en la API de Mercado Pago
 */
export async function createMercadoPagoPreference(bookingData) {
  if (!MP_ACCESS_TOKEN) {
    // Modo simulación/sandbox local si no hay token configurado
    return {
      ok: true,
      init_point: null,
      sandbox_init_point: null,
      mock: true,
      message: "Mercado Pago no configurado en entorno. Se utiliza coordinación manual.",
    };
  }

  const payload = buildPreferencePayload(bookingData);

  try {
    const res = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return { ok: false, error: errData.message || "Error al crear preferencia en Mercado Pago" };
    }

    const data = await res.json();
    return {
      ok: true,
      id: data.id,
      init_point: data.init_point,
      sandbox_init_point: data.sandbox_init_point,
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

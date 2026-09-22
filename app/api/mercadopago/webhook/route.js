import { NextResponse } from "next/server";
import { getDb, isFirebaseConfigured } from "../../../../lib/firebase";

export async function POST(req) {
  try {
    const url = new URL(req.url);
    const body = await req.json().catch(() => ({}));

    // El ID de pago puede venir en el body o en searchParams
    const paymentId =
      body?.data?.id ||
      body?.id ||
      url.searchParams.get("data.id") ||
      url.searchParams.get("id");

    const action = body?.action || body?.type || url.searchParams.get("topic");

    if (!paymentId) {
      return NextResponse.json({ received: true, note: "Sin ID de pago" });
    }

    const token = process.env.MP_ACCESS_TOKEN;
    if (!token) {
      console.warn("Mercado Pago webhook recibido pero MP_ACCESS_TOKEN no está configurado.");
      return NextResponse.json({ received: true, note: "Token no configurado" });
    }

    // Consultar el estado del pago en la API de Mercado Pago
    const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!mpRes.ok) {
      console.error(`Error consultando pago ${paymentId} en Mercado Pago`);
      return NextResponse.json({ received: true, error: "Error consultando MP" });
    }

    const payment = await mpRes.json();
    const { status, external_reference, transaction_amount } = payment;

    if (status === "approved" && external_reference && isFirebaseConfigured()) {
      const db = getDb();
      // Buscar la reserva por bookingCode (external_reference)
      const snapshot = await db
        .ref("bookings")
        .orderByChild("bookingCode")
        .equalTo(external_reference)
        .once("value");

      if (snapshot.exists()) {
        snapshot.forEach((child) => {
          child.ref.update({
            paymentStatus: "approved",
            paymentId: String(paymentId),
            paidAmount: transaction_amount,
            paidAt: Date.now(),
          });
        });
        console.log(`Pago ${paymentId} aprobado y registrado para ${external_reference}`);
      }
    }

    return NextResponse.json({ received: true, status });
  } catch (err) {
    console.error("Error procesando webhook de Mercado Pago:", err);
    return NextResponse.json({ received: true, error: err.message }, { status: 500 });
  }
}

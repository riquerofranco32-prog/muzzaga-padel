import { NextResponse } from "next/server";
import { createMercadoPagoPreference, calculateDeposit } from "../../../../lib/mercadopago";

export async function POST(req) {
  try {
    const body = await req.json();
    const {
      bookingCode,
      courtName,
      date,
      startTime,
      endTime,
      total,
      playerName,
    } = body;

    if (!bookingCode) {
      return NextResponse.json(
        { ok: false, error: "Falta bookingCode" },
        { status: 400 }
      );
    }

    const amount = calculateDeposit(total || 60000);

    const result = await createMercadoPagoPreference({
      bookingCode,
      courtName: courtName || "Cancha de Pádel",
      date: date || "",
      startTime: startTime || "",
      endTime: endTime || "",
      amount,
      payerName: playerName || "Jugador",
    });

    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err.message || "Error interno del servidor" },
      { status: 500 }
    );
  }
}
